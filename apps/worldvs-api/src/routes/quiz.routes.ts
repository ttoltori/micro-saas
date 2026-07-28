import { Hono } from "hono";
import type { DatabaseClient } from "@worldvs/database";
import {
  generateQuizSession,
  getQuizSession,
  submitQuizResult,
  getQuizResult,
} from "../features/quiz/quiz.sql.js";
import { success, error } from "../utils/response.js";
import { AppError, errorCodes, notFound } from "../errors/error-codes.js";

export function createQuizRoutes(db: DatabaseClient) {
  const router = new Hono();

  router.post("/sessions", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const mode = body.mode ?? "DAILY_10";
    const category = body.category ?? null;
    const difficulty = body.difficulty ?? null;

    try {
      const session = await generateQuizSession(db, { mode, category, difficulty });
      return success(c, session, 201);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return error(c, new AppError(errorCodes.INTERNAL_ERROR, msg, 500));
    }
  });

  router.get("/sessions/:sessionId", async (c) => {
    const sessionId = c.req.param("sessionId");
    try {
      const session = await getQuizSession(db, sessionId);
      return success(c, session);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg === "QUIZ_SESSION_NOT_FOUND") {
        return error(c, notFound("QUIZ_SESSION_NOT_FOUND", "퀴즈 세션을 찾을 수 없습니다."));
      }
      return error(c, new AppError(errorCodes.INTERNAL_ERROR, msg, 500));
    }
  });

  router.post("/sessions/:sessionId/submit", async (c) => {
    const sessionId = c.req.param("sessionId");
    const body = await c.req.json();

    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return error(c, new AppError(errorCodes.VALIDATION_ERROR, "answers 배열이 필요합니다.", 400));
    }
    if (typeof body.totalDurationSeconds !== "number") {
      return error(c, new AppError(errorCodes.VALIDATION_ERROR, "totalDurationSeconds가 필요합니다.", 400));
    }

    try {
      const result = await submitQuizResult(db, sessionId, body.answers, body.totalDurationSeconds);
      return success(c, result, 201);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg === "QUIZ_SESSION_NOT_FOUND") {
        return error(c, notFound("QUIZ_SESSION_NOT_FOUND", "퀴즈 세션을 찾을 수 없습니다."));
      }
      if (msg === "QUIZ_SESSION_ALREADY_SUBMITTED") {
        return error(c, new AppError(errorCodes.QUIZ_SESSION_ALREADY_SUBMITTED, "이미 제출된 퀴즈 세션입니다.", 400));
      }
      return error(c, new AppError(errorCodes.INTERNAL_ERROR, msg, 500));
    }
  });

  router.get("/results/:resultId", async (c) => {
    const resultId = c.req.param("resultId");
    try {
      const result = await getQuizResult(db, resultId);
      return success(c, result);
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
