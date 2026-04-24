/**
 * Unit tests for MicButtonTooltip (T068).
 *
 * Validates:
 *  - visibility is driven by the `visible` prop AND presence of micRef
 *  - "Try it now" fires `onTryItNow`, NOT `onClose`
 *  - "X" close fires `onClose`, NOT `onTryItNow`
 *  - Android back handler is wired via `useDismissOnBack(visible, onClose)` —
 *    i.e. back = X semantics (FR-039), never "Try it now"
 */

import React from "react";
import { View } from "react-native";

interface ReactTestRendererInstance {
  root: { findByType: (type: unknown) => { props: Record<string, unknown> } };
  toJSON: () => unknown;
  unmount: () => void;
}
interface ReactTestRendererModule {
  create: (element: React.ReactElement) => ReactTestRendererInstance;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const RTR: ReactTestRendererModule = require("react-test-renderer");

// =============================================================================
// Mocks
// =============================================================================

const mockMicRef: React.RefObject<View> = { current: null };
const mockRefState: { current: React.RefObject<View> | null } = {
  current: mockMicRef,
};

jest.mock("@/context/MicButtonRefContext", () => ({
  useMicButtonRef: (): React.RefObject<View> | null => mockRefState.current,
}));

const mockUseDismissOnBack = jest.fn<void, [boolean, () => void]>();
jest.mock("@/hooks/useDismissOnBack", () => ({
  useDismissOnBack: (visible: boolean, onDismiss: () => void): void =>
    mockUseDismissOnBack(visible, onDismiss),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const mockAnchoredTooltip = jest.fn((_props: Record<string, unknown>) => null);
jest.mock("@/components/ui/AnchoredTooltip", () => ({
  AnchoredTooltip: (props: Record<string, unknown>) =>
    mockAnchoredTooltip(props),
}));

// eslint-disable-next-line import/first
import { MicButtonTooltip } from "@/components/dashboard/MicButtonTooltip";

// =============================================================================
// Tests
// =============================================================================

describe("MicButtonTooltip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRefState.current = mockMicRef;
  });

  it("renders null when visible is false", () => {
    const r = RTR.create(
      React.createElement(MicButtonTooltip, {
        visible: false,
        onTryItNow: jest.fn(),
        onClose: jest.fn(),
      })
    );
    expect(r.toJSON()).toBeNull();
    expect(mockAnchoredTooltip).not.toHaveBeenCalled();
  });

  it("renders null when micRef is missing (tab bar not mounted)", () => {
    mockRefState.current = null;
    const r = RTR.create(
      React.createElement(MicButtonTooltip, {
        visible: true,
        onTryItNow: jest.fn(),
        onClose: jest.fn(),
      })
    );
    expect(r.toJSON()).toBeNull();
  });

  it("renders AnchoredTooltip with both primary and close callbacks when visible", () => {
    const onTryItNow = jest.fn();
    const onClose = jest.fn();
    RTR.create(
      React.createElement(MicButtonTooltip, {
        visible: true,
        onTryItNow,
        onClose,
      })
    );
    expect(mockAnchoredTooltip).toHaveBeenCalled();
    const props = mockAnchoredTooltip.mock.calls[0][0];
    expect(props.visible).toBe(true);
    expect(props.title).toBe("mic_button_tooltip_title");
    expect(props.body).toBe("mic_button_tooltip_body");
    expect(props.primaryLabel).toBe("mic_button_tooltip_try_it_now");
    expect(props.onPrimaryPress).toBe(onTryItNow);
    expect(props.onClose).toBe(onClose);
  });

  it("wires hardware back to onClose (X semantics), not onTryItNow", () => {
    const onTryItNow = jest.fn();
    const onClose = jest.fn();
    RTR.create(
      React.createElement(MicButtonTooltip, {
        visible: true,
        onTryItNow,
        onClose,
      })
    );
    expect(mockUseDismissOnBack).toHaveBeenCalledWith(true, onClose);
    // Crucially NOT called with onTryItNow
    expect(mockUseDismissOnBack).not.toHaveBeenCalledWith(true, onTryItNow);
  });
});
