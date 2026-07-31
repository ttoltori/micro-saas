import { createWorldVsClient, type WorldVsClient } from "@worldvs/worldvs-api-client";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export function createApiClient(): WorldVsClient {
  return createWorldVsClient({
    baseUrl: apiBaseUrl,
    timeout: 15000,
  });
}
