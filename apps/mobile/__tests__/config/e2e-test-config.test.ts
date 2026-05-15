import {
  getAiSmsParserMode,
  getMonyviTestMode,
  isE2eTestMode,
  shouldUseFixtureSmsParser,
} from "@/config/e2e-test-config";

const originalEnv = process.env;

describe("e2e-test-config", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.EXPO_PUBLIC_MONYVI_TEST_MODE;
    delete process.env.EXPO_PUBLIC_AI_SMS_PARSER_MODE;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("defaults to production-safe mode", () => {
    expect(getMonyviTestMode()).toBe("off");
    expect(getAiSmsParserMode()).toBe("edge");
    expect(isE2eTestMode()).toBe(false);
    expect(shouldUseFixtureSmsParser()).toBe(false);
  });

  it("enables fixture parser only inside explicit E2E mode", () => {
    process.env.EXPO_PUBLIC_MONYVI_TEST_MODE = "e2e";
    process.env.EXPO_PUBLIC_AI_SMS_PARSER_MODE = "fixture";

    expect(getMonyviTestMode()).toBe("e2e");
    expect(getAiSmsParserMode()).toBe("fixture");
    expect(isE2eTestMode()).toBe(true);
    expect(shouldUseFixtureSmsParser()).toBe(true);
  });

  it("fails closed when fixture parser is requested outside E2E mode", () => {
    process.env.EXPO_PUBLIC_MONYVI_TEST_MODE = "off";
    process.env.EXPO_PUBLIC_AI_SMS_PARSER_MODE = "fixture";

    expect(shouldUseFixtureSmsParser()).toBe(false);
  });

  it("ignores unknown environment values", () => {
    process.env.EXPO_PUBLIC_MONYVI_TEST_MODE = "staging";
    process.env.EXPO_PUBLIC_AI_SMS_PARSER_MODE = "mock";

    expect(getMonyviTestMode()).toBe("off");
    expect(getAiSmsParserMode()).toBe("edge");
  });
});
