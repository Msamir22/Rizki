export type MonyviTestMode = "off" | "e2e";
export type AiSmsParserMode = "edge" | "fixture";

function getPublicMonyviTestModeEnv(): string | undefined {
  return globalThis.process?.env.NODE_ENV === "test"
    ? globalThis.process.env["EXPO_PUBLIC_MONYVI_TEST_MODE"]
    : process.env.EXPO_PUBLIC_MONYVI_TEST_MODE;
}

function getPublicAiSmsParserModeEnv(): string | undefined {
  return globalThis.process?.env.NODE_ENV === "test"
    ? globalThis.process.env["EXPO_PUBLIC_AI_SMS_PARSER_MODE"]
    : process.env.EXPO_PUBLIC_AI_SMS_PARSER_MODE;
}

export function getMonyviTestMode(): MonyviTestMode {
  return getPublicMonyviTestModeEnv() === "e2e" ? "e2e" : "off";
}

export function getAiSmsParserMode(): AiSmsParserMode {
  return getPublicAiSmsParserModeEnv() === "fixture" ? "fixture" : "edge";
}

export function isE2eTestMode(): boolean {
  return getMonyviTestMode() === "e2e";
}

export function shouldUseFixtureSmsParser(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    isE2eTestMode() &&
    getAiSmsParserMode() === "fixture"
  );
}
