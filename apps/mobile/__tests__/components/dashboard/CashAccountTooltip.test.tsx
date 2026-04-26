/**
 * Unit tests for CashAccountTooltip (T059).
 *
 * Validates the self-gating visibility logic required by spec FR-017/FR-020:
 *  (a) not rendered when !isFirstRunPending
 *  (b) not rendered when SMS prompt is visible (shouldShowPrompt === true)
 *  (c) not rendered when onboardingFlags.cash_account_tooltip_dismissed === true
 *  (d) rendered when all three conditions are satisfied
 *      — and dismissal writes the flag AND calls markFirstRunConsumed()
 */

import React, { createRef } from "react";
import { View } from "react-native";

interface ReactTestRendererInstance {
  root: {
    findByType: (type: unknown) => { props: Record<string, unknown> };
    findAllByType: (type: unknown) => Array<{ props: Record<string, unknown> }>;
  };
  toJSON: () => unknown;
  unmount: () => void;
}
interface ReactTestRendererModule {
  act: (fn: () => void | Promise<void>) => void | Promise<void>;
  create: (element: React.ReactElement) => ReactTestRendererInstance;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const RTR: ReactTestRendererModule = require("react-test-renderer");

// =============================================================================
// Mocks — each test overrides return values via mocked module exports.
// =============================================================================

const mockFirstRunCtx = {
  isFirstRunPending: false,
  markFirstRunPending: jest.fn(),
  markFirstRunConsumed: jest.fn(),
};

const mockFlags: {
  cash_account_tooltip_dismissed?: boolean;
  voice_tooltip_seen?: boolean;
} = {};

// `isSmsPromptVisible` is now a prop (not a hook instantiation inside the
// component), so we hold it in a closure var the tests can flip.
let mockIsSmsPromptVisible = false;

jest.mock("@/context/FirstRunTooltipContext", () => ({
  useFirstRunTooltip: () => mockFirstRunCtx,
}));

jest.mock("@/hooks/useOnboardingFlags", () => ({
  useOnboardingFlags: () => mockFlags,
}));

jest.mock("@/hooks/useDismissOnBack", () => ({
  useDismissOnBack: jest.fn(),
}));

const mockSetOnboardingFlag = jest.fn<Promise<void>, [string, boolean]>(() =>
  Promise.resolve()
);
jest.mock("@/services/profile-service", () => ({
  setOnboardingFlag: (key: string, value: boolean) =>
    mockSetOnboardingFlag(key, value),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockAnchoredTooltip = jest.fn(
  (_props: Record<string, unknown>) => null as unknown
);
jest.mock("@/components/ui/AnchoredTooltip", () => ({
  AnchoredTooltip: (props: Record<string, unknown>) =>
    mockAnchoredTooltip(props),
}));

// eslint-disable-next-line import/first
import { CashAccountTooltip } from "@/components/dashboard/CashAccountTooltip";

// =============================================================================
// Helpers
// =============================================================================

interface Overrides {
  isFirstRunPending?: boolean;
  shouldShowPrompt?: boolean;
  cash_account_tooltip_dismissed?: boolean;
}

function resetCtx(overrides: Overrides): void {
  mockFirstRunCtx.isFirstRunPending = overrides.isFirstRunPending ?? false;
  mockIsSmsPromptVisible = overrides.shouldShowPrompt ?? false;
  mockFlags.cash_account_tooltip_dismissed =
    overrides.cash_account_tooltip_dismissed ?? undefined;
}

function renderTooltip(): ReactTestRendererInstance {
  const anchorRef = createRef<View>();
  return RTR.create(
    React.createElement(CashAccountTooltip, {
      anchorRef,
      isSmsPromptVisible: mockIsSmsPromptVisible,
    })
  );
}

// =============================================================================
// Tests
// =============================================================================

describe("CashAccountTooltip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCtx({});
  });

  it("renders null when isFirstRunPending is false", () => {
    resetCtx({ isFirstRunPending: false });
    const r = renderTooltip();
    expect(r.toJSON()).toBeNull();
  });

  it("renders null when SMS prompt is visible (gating by isSmsPromptVisible prop)", () => {
    resetCtx({ isFirstRunPending: true, shouldShowPrompt: true });
    const r = renderTooltip();
    expect(r.toJSON()).toBeNull();
  });

  it("renders null when the tooltip has already been dismissed", () => {
    resetCtx({
      isFirstRunPending: true,
      shouldShowPrompt: false,
      cash_account_tooltip_dismissed: true,
    });
    const r = renderTooltip();
    expect(r.toJSON()).toBeNull();
  });

  it("renders AnchoredTooltip when all three conditions are satisfied", () => {
    resetCtx({ isFirstRunPending: true });
    renderTooltip();
    expect(mockAnchoredTooltip).toHaveBeenCalled();
    const props = mockAnchoredTooltip.mock.calls[0][0];
    expect(props.visible).toBe(true);
    expect(props.title).toBe("cash_account_tooltip_title");
    expect(props.body).toBe("cash_account_tooltip_body");
    expect(props.primaryLabel).toBe("cash_account_tooltip_got_it");
  });

  it("dismissal writes the flag and calls markFirstRunConsumed", async () => {
    resetCtx({ isFirstRunPending: true });
    renderTooltip();

    const props = mockAnchoredTooltip.mock.calls[0][0];
    const onPrimary = props.onPrimaryPress as () => void;
    onPrimary();

    // setOnboardingFlag resolves → markFirstRunConsumed() runs. Flush the promise.
    await Promise.resolve();
    await Promise.resolve();

    expect(mockSetOnboardingFlag).toHaveBeenCalledWith(
      "cash_account_tooltip_dismissed",
      true
    );
    expect(mockFirstRunCtx.markFirstRunConsumed).toHaveBeenCalled();
  });
});
