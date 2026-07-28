import "dotenv/config";

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  port: parseInt(process.env.PORT ?? "3001", 10),
  baseUrl: process.env.APP_BASE_URL ?? "http://localhost:3001",
  logLevel: process.env.LOG_LEVEL ?? "info",
  isProduction: process.env.NODE_ENV === "production",
};

export function validateEnv(): void {
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  }
}
