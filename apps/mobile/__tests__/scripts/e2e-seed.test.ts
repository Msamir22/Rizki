import {
  E2E_TABLE_DELETE_ORDER,
  getE2eSeedConfig,
  seedE2eData,
} from "../../scripts/e2e-seed";

describe("e2e-seed script helpers", () => {
  it("uses safe local defaults only for local Supabase mode", () => {
    const config = getE2eSeedConfig({
      E2E_SUPABASE_MODE: "local",
      E2E_LOCAL_JWT_SECRET: "local-test-jwt-secret-with-enough-length",
      MAESTRO_E2E_EMAIL: "e2e@monyvi.test",
      MAESTRO_E2E_PASSWORD: "Password123!",
    });

    expect(config.mode).toBe("local");
    expect(config.supabaseUrl).toBe("http://127.0.0.1:54321");
    expect(config.appSupabaseUrl).toBe("http://10.0.2.2:54321");
    expect(config.email).toBe("e2e@monyvi.test");
    expect(config.password).toBe("Password123!");
    expect(config.serviceRoleKey).toContain("eyJ");
  });

  it("fails fast when local E2E credentials are missing", () => {
    expect(() =>
      getE2eSeedConfig({
        E2E_SUPABASE_MODE: "local",
      })
    ).toThrow("E2E_LOCAL_JWT_SECRET");
  });

  it("uses explicit local Supabase keys without requiring the local JWT secret", () => {
    const config = getE2eSeedConfig({
      E2E_SUPABASE_MODE: "local",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      MAESTRO_E2E_EMAIL: "e2e@monyvi.test",
      MAESTRO_E2E_PASSWORD: "Password123!",
    });

    expect(config.anonKey).toBe("anon-key");
    expect(config.serviceRoleKey).toBe("service-role-key");
  });

  it("requires explicit service role and credentials for remote Supabase mode", () => {
    expect(() =>
      getE2eSeedConfig({
        E2E_SUPABASE_MODE: "remote",
        EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      })
    ).toThrow("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("deletes child tables before parent tables for the seeded user", () => {
    expect(E2E_TABLE_DELETE_ORDER.indexOf("transactions")).toBeLessThan(
      E2E_TABLE_DELETE_ORDER.indexOf("accounts")
    );
    expect(E2E_TABLE_DELETE_ORDER.indexOf("transfers")).toBeLessThan(
      E2E_TABLE_DELETE_ORDER.indexOf("accounts")
    );
    expect(E2E_TABLE_DELETE_ORDER.at(-1)).toBe("profiles");
  });

  it("resets and seeds only rows scoped to the E2E user", async () => {
    const operations: string[] = [];
    const client = createMockClient(operations);

    await seedE2eData(client, {
      ...getE2eSeedConfig({
        E2E_SUPABASE_MODE: "local",
        E2E_LOCAL_JWT_SECRET: "local-test-jwt-secret-with-enough-length",
        MAESTRO_E2E_EMAIL: "e2e@monyvi.test",
        MAESTRO_E2E_PASSWORD: "Password123!",
      }),
      userId: "user-e2e",
    });

    expect(operations).toContain("delete:transactions:user_id:user-e2e");
    expect(operations).toContain("delete:accounts:user_id:user-e2e");
    expect(operations).toContain("upsert:profiles:user-e2e");
    expect(operations).toContain("upsert:accounts:3");
    expect(operations).toContain("upsert:transactions:2");
    expect(operations).toContain("upsert:transfers:1");
  });

  it("syncs credentials when the E2E auth user already exists", async () => {
    const operations: string[] = [];
    const client = createMockClient(operations);

    await seedE2eData(client, {
      ...getE2eSeedConfig({
        E2E_SUPABASE_MODE: "local",
        E2E_LOCAL_JWT_SECRET: "local-test-jwt-secret-with-enough-length",
        MAESTRO_E2E_EMAIL: "e2e@monyvi.test",
        MAESTRO_E2E_PASSWORD: "Password123!",
      }),
    });

    expect(operations).toContain("update-user:user-e2e");
  });
});

function createMockClient(operations: string[]): unknown {
  return {
    auth: {
      admin: {
        listUsers: () =>
          Promise.resolve({
            data: { users: [{ id: "user-e2e", email: "e2e@monyvi.test" }] },
            error: null,
          }),
        updateUserById: (userId: string) => {
          operations.push(`update-user:${userId}`);
          return Promise.resolve({ error: null });
        },
      },
    },
    from: (table: string) => ({
      delete: () => ({
        eq: (column: string, value: string) => {
          operations.push(`delete:${table}:${column}:${value}`);
          return Promise.resolve({ error: null });
        },
      }),
      upsert: (rows: unknown[] | { user_id?: string }, options?: unknown) => {
        const marker = Array.isArray(rows)
          ? `${rows.length}`
          : String(rows.user_id ?? "unknown");
        operations.push(`upsert:${table}:${marker}`);
        return {
          select: () => ({
            single: () => Promise.resolve({ data: rows, error: null }),
          }),
          options,
        };
      },
    }),
  };
}
