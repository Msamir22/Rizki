const { spawnSync } = require("node:child_process");
const { getE2eSeedConfig } = require("./e2e-seed");

function resolveNpxCommand() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function main() {
  const config = getE2eSeedConfig({
    ...process.env,
    E2E_SUPABASE_MODE: "local",
  });

  const env = {
    ...process.env,
    E2E_SUPABASE_MODE: "local",
    EXPO_PUBLIC_MONYVI_TEST_MODE: "e2e",
    EXPO_PUBLIC_AI_SMS_PARSER_MODE: "fixture",
    EXPO_PUBLIC_SUPABASE_URL: config.appSupabaseUrl,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: config.anonKey,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
    EXPO_NO_TELEMETRY: "1",
    CI: process.env.CI ?? "1",
  };

  const args =
    process.argv.length > 2
      ? ["expo", "start", ...process.argv.slice(2)]
      : ["expo", "start", "--clear", "--dev-client", "--port", "8081"];

  const result = spawnSync(resolveNpxCommand(), args, {
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  process.exit(result.status ?? 1);
}

main();
