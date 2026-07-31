import "dotenv/config";

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  port: parseInt(process.env.PORT ?? "3002", 10),
  baseUrl: process.env.APP_BASE_URL ?? "http://localhost:3002",
  logLevel: process.env.LOG_LEVEL ?? "info",
  isProduction: process.env.NODE_ENV === "production",
};

export function validateEnv(): void {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  }
}
