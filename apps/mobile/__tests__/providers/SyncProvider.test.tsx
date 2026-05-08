/**
 * @file SyncProvider.test.tsx
 * @description Unit tests for SyncProvider's new initialSyncState and retryInitialSync.
 *
 * Tests the state machine: in-progress → success | failed | timeout,
 * the 20-second timeout race, and retryInitialSync().
 */

import React from "react";

// ---------------------------------------------------------------------------
// Test renderer utilities
// ---------------------------------------------------------------------------

interface ReactTestRendererInstance {
  unmount: () => void;
}

interface ReactTestRendererModule {
  act: (...args: unknown[]) => unknown;
  create: (element: React.ReactElement) => ReactTestRendererInstance;
}

// Lazy-load react-test-renderer so it doesn't drag `react-native` into the
// module cache before our AppState mock (from __tests__/setup.ts) is applied.
// Without this, `AppState.addEventListener` comes out as undefined when
// SyncProvider's useEffect runs and the test crashes.
function getRTR(): ReactTestRendererModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return
  return require("react-test-renderer");
}

const actSync = ((fn: () => void) => getRTR().act(fn)) as (
  fn: () => void
) => void;

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockSyncDatabase = jest.fn();
const mockCheckIsAuthenticated = jest.fn();
const mockFetchProfileCount = jest.fn();
const mockDbGet = jest.fn();
const mockWhere = jest.fn((column: string, value: unknown) => ({
  column,
  value,
}));

jest.mock("@/services/sync", () => ({
  syncDatabase: (...args: unknown[]): Promise<unknown> =>
    mockSyncDatabase(...args) as Promise<unknown>,
}));

jest.mock("@/services/supabase", () => ({
  isAuthenticated: (): Promise<boolean> =>
    mockCheckIsAuthenticated() as Promise<boolean>,
}));

jest.mock("@monyvi/db", () => ({
  database: {
    get: (table: string): unknown => mockDbGet(table),
  },
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: "current-user" } }),
}));

jest.mock("@nozbe/watermelondb", () => ({
  Q: {
    where: (column: string, value: unknown): unknown =>
      mockWhere(column, value),
  },
}));

// Import after mocks
import { SyncProvider, useSync } from "../../providers/SyncProvider";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SyncContextSnapshot {
  initialSyncState: string;
  retryInitialSync: () => Promise<string>;
}

function renderAndCapture(): {
  result: React.MutableRefObject<SyncContextSnapshot>;
  unmount: () => void;
} {
  const resultRef =
    React.createRef() as React.MutableRefObject<SyncContextSnapshot>;

  const CaptureComponent = (): React.JSX.Element | null => {
    const { initialSyncState, retryInitialSync } = useSync();
    resultRef.current = { initialSyncState, retryInitialSync };
    return null;
  };

  let renderer: ReactTestRendererInstance | null = null;
  getRTR().act(() => {
    renderer = getRTR().create(
      React.createElement(
        SyncProvider,
        null,
        React.createElement(CaptureComponent)
      )
    );
  });

  if (renderer === null) {
    throw new Error("renderer not initialised");
  }
  const mountedRenderer = renderer as ReactTestRendererInstance;

  return { result: resultRef, unmount: () => mountedRenderer.unmount() };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SyncProvider initialSyncState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockCheckIsAuthenticated.mockResolvedValue(true);
    mockFetchProfileCount.mockResolvedValue(0);
    mockDbGet.mockReturnValue({
      query: jest.fn(() => ({ fetchCount: mockFetchProfileCount })),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('starts with initialSyncState "in-progress"', () => {
    mockSyncDatabase.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderAndCapture();
    expect(result.current.initialSyncState).toBe("in-progress");
  });

  // Helper — flush pending microtasks without running every timer. We can't
  // use `jest.runAllTimersAsync()` here: SyncProvider's effect also schedules
  // a 15-minute setInterval, and runAllTimers re-fires it forever (test
  // hangs). Instead we advance past the 20s sync-timeout boundary only.
  async function flushInitialSync(): Promise<void> {
    // Advance just past the 20s race — enough to settle both resolve and
    // reject branches of Promise.race without triggering the 15-min interval.
    await getRTR().act(async () => {
      await jest.advanceTimersByTimeAsync(20_500);
    });
    await flushStartupMicrotasks();
  }

  async function flushStartupMicrotasks(): Promise<void> {
    await getRTR().act(async () => {
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
      }
    });
  }

  async function waitForInitialSyncState(
    result: React.MutableRefObject<SyncContextSnapshot>,
    expectedState: string
  ): Promise<void> {
    for (let attempt = 0; attempt < 20; attempt++) {
      if (result.current?.initialSyncState === expectedState) {
        return;
      }

      await flushStartupMicrotasks();
    }

    throw new Error(
      `Expected initialSyncState "${expectedState}", received "${result.current?.initialSyncState}"`
    );
  }

  it('transitions to "success" when sync completes within timeout', async () => {
    mockSyncDatabase.mockResolvedValue(undefined);
    const { result } = renderAndCapture();

    await waitForInitialSyncState(result, "success");
    actSync(() => {
      // No-op - just trigger a React update
    });

    expect(result.current.initialSyncState).toBe("success");
  });

  it("checks the current user's profile instead of accounts before trusting local startup data", async () => {
    mockFetchProfileCount.mockResolvedValue(1);
    mockSyncDatabase.mockResolvedValue(undefined);
    const { result } = renderAndCapture();

    await flushStartupMicrotasks();
    actSync(() => {
      // No-op - just trigger a React update
    });

    expect(mockDbGet).toHaveBeenCalledWith("profiles");
    expect(mockWhere).toHaveBeenCalledWith("user_id", "current-user");
    expect(mockWhere).toHaveBeenCalledWith("deleted", false);
    expect(mockSyncDatabase).toHaveBeenCalledWith(expect.anything(), false);
    expect(result.current.initialSyncState).toBe("success");
  });

  it('transitions to "failed" when sync throws before timeout', async () => {
    mockSyncDatabase.mockRejectedValue(new Error("Network error"));
    const { result } = renderAndCapture();

    await waitForInitialSyncState(result, "failed");
    actSync(() => {
      // No-op - just trigger a React update
    });

    expect(result.current.initialSyncState).toBe("failed");
  });

  it('transitions to "timeout" when sync takes longer than 20 seconds', async () => {
    mockSyncDatabase.mockReturnValue(new Promise(() => {}));
    const { result } = renderAndCapture();

    await flushInitialSync();
    actSync(() => {
      // Trigger a React update so the captured ref sees the latest state.
    });

    expect(result.current.initialSyncState).toBe("timeout");
  });

  it("provides retryInitialSync as a callable function", () => {
    mockSyncDatabase.mockReturnValue(new Promise(() => {}));
    const { result } = renderAndCapture();
    expect(typeof result.current.retryInitialSync).toBe("function");
  });
});
