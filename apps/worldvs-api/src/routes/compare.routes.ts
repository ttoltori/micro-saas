import { Hono } from "hono";
import type { DatabaseClient } from "@worldvs/database";
import {
  getComparison,
  getTrending,
  getDailyCompare,
  logCompareView,
} from "../features/compare/compare.sql.js";
import { success, error } from "../utils/response.js";
import { notFound, AppError, errorCodes } from "../errors/error-codes.js";

export function createCompareRoutes(db: DatabaseClient) {
  const router = new Hono();

  router.get("/trending", async (c) => {
    const limit = parseInt(c.req.query("limit") ?? "10", 10);
    const items = await getTrending(db, limit);
    return success(c, items);
  });

  router.get("/daily", async (c) => {
    const daily = await getDailyCompare(db);
    return success(c, daily);
  });

  router.get("/:leftCode/:rightCode", async (c) => {
    const leftCode = c.req.param("leftCode");
    const rightCode = c.req.param("rightCode");

    try {
      const comparison = await getComparison(db, leftCode, rightCode);
      logCompareView(db, leftCode, rightCode).catch(() => {});
      return success(c, comparison);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg.includes("Country not found")) {
        return error(c, notFound("COUNTRY_NOT_FOUND", msg));
      }
      return error(c, new AppError(errorCodes.INTERNAL_ERROR, msg, 500));
    }
  });

  return router;
}
