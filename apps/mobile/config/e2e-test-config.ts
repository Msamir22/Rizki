export type MonyviTestMode = "off" | "e2e";
export type AiSmsParserMode = "edge" | "fixture";

const PROCESS_ENV_KEY = "env";

function getRuntimeEnv(): NodeJS.ProcessEnv {
  return process[PROCESS_ENV_KEY as "env"];
}

export function getMonyviTestMode(): MonyviTestMode {
  return getRuntimeEnv().EXPO_PUBLIC_MONYVI_TEST_MODE === "e2e" ? "e2e" : "off";
}

export function getAiSmsParserMode(): AiSmsParserMode {
  return getRuntimeEnv().EXPO_PUBLIC_AI_SMS_PARSER_MODE === "fixture"
    ? "fixture"
    : "edge";
}

export function isE2eTestMode(): boolean {
  return getMonyviTestMode() === "e2e";
}

export function shouldUseFixtureSmsParser(): boolean {
  return isE2eTestMode() && getAiSmsParserMode() === "fixture";
}
