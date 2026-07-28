import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createDb } from "@worldvs/database";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { error } from "./utils/response.js";
import { AppError, errorCodes } from "./errors/error-codes.js";
import { createCountryRoutes } from "./routes/country.routes.js";
import { createIndicatorRoutes } from "./routes/indicator.routes.js";
import { createCompareRoutes } from "./routes/compare.routes.js";
import { createQuizRoutes } from "./routes/quiz.routes.js";
import { createLeaderboardRoutes } from "./routes/leaderboard.routes.js";

export function createApp() {
  const app = new Hono();
  const db = createDb();

  app.use("*", logger());
  app.use("*", cors());
  app.use("*", requestIdMiddleware());

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.route("/v1/countries", createCountryRoutes(db));
  app.route("/v1/indicators", createIndicatorRoutes(db));
  app.route("/v1/compare", createCompareRoutes(db));
  app.route("/v1/quiz", createQuizRoutes(db));
  app.route("/v1/leaderboard", createLeaderboardRoutes(db));

  app.notFound((c) =>
    error(c, new AppError("NOT_FOUND" as ErrorCode, "요청한 리소스를 찾을 수 없습니다.", 404)),
  );

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return error(c, err);
    }
    console.error("Unhandled error:", err);
    return error(c, new AppError(errorCodes.INTERNAL_ERROR, "서버 내부 오류가 발생했습니다.", 500));
  });

  return app;
}

type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes];
