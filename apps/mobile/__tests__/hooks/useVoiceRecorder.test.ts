/**
 * useVoiceRecorder.test.ts — T022
 *
 * Tests the useVoiceRecorder hook's state machine, permission flow,
 * and recording lifecycle.
 *
 * Mock Strategy:
 *   - expo-audio: mocked entirely to avoid native module dependencies
 *   - expo-file-system: mocked for temp file cleanup testing
 *   - Lightweight renderHook utility from react-test-renderer (project pattern)
 */

import React, { createElement, useState } from "react";

// ---------------------------------------------------------------------------
// react-test-renderer — manual types & import (project pattern)
// ---------------------------------------------------------------------------

interface ReactTestRendererInstance {
  unmount: () => void;
}

interface ReactTestRendererModule {
  act: (...args: unknown[]) => unknown;
  create: (element: React.ReactElement) => ReactTestRendererInstance;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const RTR: ReactTestRendererModule = require("react-test-renderer");

const actSync = RTR.act as (fn: () => void) => void;
const actAsync = RTR.act as (fn: () => Promise<void>) => Promise<void>;

// ---------------------------------------------------------------------------
// Mock state tracking
// ---------------------------------------------------------------------------

const mockRecord = jest.fn();
const mockPause = jest.fn();
const mockStop = jest.fn().mockResolvedValue(undefined);
const mockPrepareToRecordAsync = jest.fn().mockResolvedValue(undefined);
const mockRequestPermissions = jest.fn().mockResolvedValue({ granted: true });
const mockSetAudioModeAsync = jest.fn().mockResolvedValue(undefined);
const mockDeleteAsync = jest.fn().mockResolvedValue(undefined);
const mockGetInfoAsync = jest.fn().mockResolvedValue({ exists: true });

const mockRecorder = {
  record: mockRecord,
  pause: mockPause,
  stop: mockStop,
  prepareToRecordAsync: mockPrepareToRecordAsync,
  getUri: jest.fn().mockReturnValue("file:///tmp/recording.m4a"),
  uri: "file:///tmp/recording.m4a",
};

jest.mock("expo-audio", () => ({
  useAudioRecorder: jest.fn(() => mockRecorder),
  useAudioRecorderState: jest.fn(() => ({
    isRecording: false,
    durationMillis: 0,
  })),
  AudioModule: {
    requestRecordingPermissionsAsync: (...args: unknown[]): Promise<unknown> =>
      mockRequestPermissions(...args) as Promise<unknown>,
    getRecordingPermissionsAsync: (): Promise<{ granted: boolean }> =>
      Promise.resolve({ granted: false }),
  },
  RecordingPresets: {
    HIGH_QUALITY: {},
  },
  setAudioModeAsync: (...args: unknown[]): Promise<unknown> =>
    mockSetAudioModeAsync(...args) as Promise<unknown>,
}));

jest.mock("expo-file-system", () => ({
  deleteAsync: (...args: unknown[]): Promise<unknown> =>
    mockDeleteAsync(...args) as Promise<unknown>,
  getInfoAsync: (...args: unknown[]): Promise<unknown> =>
    mockGetInfoAsync(...args) as Promise<unknown>,
}));

// ---------------------------------------------------------------------------
// Import module under test — after mocks
// ---------------------------------------------------------------------------

import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

// ---------------------------------------------------------------------------
// Lightweight renderHook utility (project pattern)
// ---------------------------------------------------------------------------

const mountedUnmounts: Array<() => void> = [];

interface HookRef<T> {
  current: T | null;
}

function unwrap<T>(ref: HookRef<T>): T {
  if (ref.current === null) {
    throw new Error("Hook ref is null — did the component render?");
  }
  return ref.current;
}

function renderHook<T>(hookFn: () => T): {
  result: HookRef<T>;
  rerender: () => void;
  unmount: () => void;
} {
  const result: HookRef<T> = { current: null };
  let forceUpdate: (() => void) | null = null;

  function TestComponent(): null {
    result.current = hookFn();
    const [, setState] = useState(0);
    forceUpdate = () => setState((n) => n + 1);
    return null;
  }

  let renderer: ReactTestRendererInstance;

  actSync(() => {
    renderer = RTR.create(createElement(TestComponent));
  });

  mountedUnmounts.push(() => {
    actSync(() => {
      renderer.unmount();
    });
  });

  return {
    result,
    rerender: () => {
      actSync(() => {
        forceUpdate?.();
      });
    },
    unmount: () => {
      actSync(() => {
        renderer.unmount();
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useVoiceRecorder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    mountedUnmounts.splice(0).forEach((fn) => fn());
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // =========================================================================
  // Initial state
  // =========================================================================
  describe("initial state", () => {
    it("should start with idle status", () => {
      const { result } = renderHook(() => useVoiceRecorder());
      const hook = unwrap(result);
      expect(hook.status).toBe("idle");
      expect(hook.isRecording).toBe(false);
      expect(hook.durationMs).toBe(0);
      expect(hook.audioUri).toBeNull();
    });
  });

  // =========================================================================
  // Permission
  // =========================================================================
  describe("requestPermission", () => {
    it("should request and grant permission", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      const { result } = renderHook(() => useVoiceRecorder());

      let granted = false;
      await actAsync(async () => {
        granted = await unwrap(result).requestPermission();
      });

      expect(granted).toBe(true);
      expect(unwrap(result).hasPermission).toBe(true);
    });

    it("should return false when permission is denied", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: false });
      const { result } = renderHook(() => useVoiceRecorder());

      let granted = true;
      await actAsync(async () => {
        granted = await unwrap(result).requestPermission();
      });

      expect(granted).toBe(false);
      expect(unwrap(result).hasPermission).toBe(false);
    });
  });

  // =========================================================================
  // Start recording
  // =========================================================================
  describe("start", () => {
    it("should request permission and transition to recording", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      const { result } = renderHook(() => useVoiceRecorder());

      await actAsync(async () => {
        await unwrap(result).start();
      });

      expect(unwrap(result).status).toBe("recording");
      expect(unwrap(result).isRecording).toBe(true);
      expect(mockPrepareToRecordAsync).toHaveBeenCalled();
      expect(mockRecord).toHaveBeenCalled();
    });

    it("should fall back to idle if prepareToRecordAsync throws", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      mockPrepareToRecordAsync.mockRejectedValueOnce(
        new Error("Native module error")
      );
      const { result } = renderHook(() => useVoiceRecorder());

      await actAsync(async () => {
        await unwrap(result).start();
      });

      expect(unwrap(result).status).toBe("idle");
    });
  });

  // =========================================================================
  // Pause / Resume
  // =========================================================================
  describe("pause and resume", () => {
    it("should transition to paused status on pause", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      const { result } = renderHook(() => useVoiceRecorder());

      await actAsync(async () => {
        await unwrap(result).start();
      });

      actSync(() => {
        unwrap(result).pause();
      });

      expect(unwrap(result).status).toBe("paused");
      expect(mockPause).toHaveBeenCalled();
    });

    it("should transition back to recording on resume", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      const { result } = renderHook(() => useVoiceRecorder());

      await actAsync(async () => {
        await unwrap(result).start();
      });

      actSync(() => {
        unwrap(result).pause();
      });

      actSync(() => {
        unwrap(result).resume();
      });

      expect(unwrap(result).status).toBe("recording");
      // start calls record once, resume calls again
      expect(mockRecord).toHaveBeenCalledTimes(2);
    });
  });

  // =========================================================================
  // Stop recording
  // =========================================================================
  describe("stop", () => {
    it("should transition to completed and return audio URI", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      const { result } = renderHook(() => useVoiceRecorder());

      await actAsync(async () => {
        await unwrap(result).start();
      });

      let stopResult: { uri: string; durationMs: number } | null = null;
      await actAsync(async () => {
        stopResult = await unwrap(result).stop();
      });

      expect(unwrap(result).status).toBe("completed");
      expect(stopResult).not.toBeNull();
      if (stopResult) {
        expect((stopResult as { uri: string }).uri).toBe(
          "file:///tmp/recording.m4a"
        );
      }
    });
  });

  // =========================================================================
  // Discard
  // =========================================================================
  describe("discard", () => {
    it("should clean up temp file and reset to idle (FR-021)", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      const { result } = renderHook(() => useVoiceRecorder());

      await actAsync(async () => {
        await unwrap(result).start();
      });

      await actAsync(async () => {
        await unwrap(result).stop();
      });

      await actAsync(async () => {
        await unwrap(result).discard();
      });

      expect(mockDeleteAsync).toHaveBeenCalled();
      expect(unwrap(result).status).toBe("idle");
      expect(unwrap(result).audioUri).toBeNull();
    });
  });

  // =========================================================================
  // Reset
  // =========================================================================
  describe("reset", () => {
    it("should reset all state back to idle", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      const { result } = renderHook(() => useVoiceRecorder());

      await actAsync(async () => {
        await unwrap(result).start();
      });

      actSync(() => {
        unwrap(result).reset();
      });

      expect(unwrap(result).status).toBe("idle");
      expect(unwrap(result).durationMs).toBe(0);
      expect(unwrap(result).audioUri).toBeNull();
    });
  });

  // =========================================================================
  // Auto-stop at 60 seconds (FR-004)
  // =========================================================================
  describe("auto-stop at 60 seconds", () => {
    it("should auto-stop recording when elapsed time reaches 60s", async () => {
      mockRequestPermissions.mockResolvedValueOnce({ granted: true });
      const { result } = renderHook(() => useVoiceRecorder());

      await actAsync(async () => {
        jest.advanceTimersByTime(60_000);
        // Flush promise chain kicked off by timer callback / stop()
        await Promise.resolve();
      });
      await actAsync(async () => {
        await Promise.resolve();
      });

      expect(mockStop).toHaveBeenCalled();
      expect(unwrap(result).status).toBe("completed");
    });
  });
});
