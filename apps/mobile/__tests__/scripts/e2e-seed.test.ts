import {
  E2E_TABLE_DELETE_ORDER,
  getE2eSeedConfig,
  seedE2eData,
} from "../../scripts/e2e-seed";

describe("e2e-seed script helpers", () => {
  it("uses safe local defaults only for local Supabase mode", () => {
    const config = getE2eSeedConfig({
      E2E_SUPABASE_MODE: "local",
    });

    expect(config.mode).toBe("local");
    expect(config.supabaseUrl).toBe("http://127.0.0.1:54321");
    expect(config.appSupabaseUrl).toBe("http://10.0.2.2:54321");
    expect(config.email).toBe("e2e@monyvi.test");
    expect(config.password).toBe("Password123!");
    expect(config.serviceRoleKey).toContain("eyJ");
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
      ...getE2eSeedConfig({ E2E_SUPABASE_MODE: "local" }),
      userId: "user-e2e",
    });

    expect(operations).toContain("delete:transactions:user_id:user-e2e");
    expect(operations).toContain("delete:accounts:user_id:user-e2e");
    expect(operations).toContain("upsert:profiles:user-e2e");
    expect(operations).toContain("upsert:accounts:3");
    expect(operations).toContain("upsert:transactions:2");
    expect(operations).toContain("upsert:transfers:1");
  });
});

function createMockClient(operations: string[]): unknown {
  return {
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
