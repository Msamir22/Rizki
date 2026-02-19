/**
 * Jest global setup — mock native modules that aren't available in test env.
 */

/* eslint-disable @typescript-eslint/no-empty-function */

// Mock expo-haptics (uses native module)
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));
