/**
 * Astik API Endpoints
 * Shared between API and Mobile for type-safe endpoint references
 */

export const ApiEndpoints = {
  // Market rates
  marketRates: "/api/market-rates",

  // Net worth
  netWorth: "/api/net-worth",

  // Mock endpoints (development)
  mock: "/api/mock",
  mockRates: "/api/mock/rates",
} as const;

export type ApiEndpoint = (typeof ApiEndpoints)[keyof typeof ApiEndpoints];

/**
 * Helper to construct endpoints with path parameters
 * Example: buildEndpoint("/api/users/:id", { id: "123" }) => "/api/users/123"
 */
export function buildEndpoint(
  endpoint: string,
  params: Record<string, string>
): string {
  let result = endpoint;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, value);
  }
  return result;
}
