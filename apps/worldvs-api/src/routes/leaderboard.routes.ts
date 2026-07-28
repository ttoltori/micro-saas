import { Hono } from "hono";
import type { DatabaseClient } from "@worldvs/database";
import {
  getLeaderboard,
  checkEligibility,
  submitScore,
} from "../features/leaderboard/leaderboard.sql.js";
import { success, error } from "../utils/response.js";
import { AppError, errorCodes, notFound } from "../errors/error-codes.js";

export function createLeaderboardRoutes(db: DatabaseClient) {
  const router = new Hono();

  router.get("/", async (c) => {
    const limit = parseInt(c.req.query("limit") ?? "100", 10);
    const result = await getLeaderboard(db, limit);
    return success(c, result);
  });

  router.get("/eligibility", async (c) => {
    const score = parseInt(c.req.query("score") ?? "0", 10);
    const durationSeconds = parseInt(c.req.query("durationSeconds") ?? "0", 10);

    const result = await checkEligibility(db, score, durationSeconds);
    return success(c, result);
  });

  router.post("/submit", async (c) => {
    const body = await c.req.json();

    if (!body.resultId || typeof body.resultId !== "string") {
      return error(c, new AppError(errorCodes.VALIDATION_ERROR, "resultId가 필요합니다.", 400));
    }
    if (!body.playerName || typeof body.playerName !== "string" || body.playerName.length < 2 || body.playerName.length > 20) {
      return error(c, new AppError(errorCodes.INVALID_PLAYER_NAME, "닉네임은 2~20자여야 합니다.", 400));
    }
    if (!body.nationalityCode || typeof body.nationalityCode !== "string" || body.nationalityCode.length !== 2) {
      return error(c, new AppError(errorCodes.VALIDATION_ERROR, "nationalityCode(2자)가 필요합니다.", 400));
    }

    try {
      const result = await submitScore(db, {
        resultId: body.resultId,
        playerName: body.playerName,
        nationalityCode: body.nationalityCode,
        deviceId: body.deviceId,
      });
      return success(c, result, 201);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg === "QUIZ_RESULT_NOT_FOUND") {
        return error(c, notFound("QUIZ_RESULT_NOT_FOUND", "퀴즈 결과를 찾을 수 없습니다."));
      }
      return error(c, new AppError(errorCodes.INTERNAL_ERROR, msg, 500));
    }
  });

  return router;
}
