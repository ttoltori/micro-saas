import { Hono } from "hono";
import type { DatabaseClient } from "@worldvs/database";
import { listIndicators } from "../features/indicator/indicator.sql.js";
import { success } from "../utils/response.js";

export function createIndicatorRoutes(db: DatabaseClient) {
  const router = new Hono();

  router.get("/", async (c) => {
    const category = c.req.query("category");
    const mvpParam = c.req.query("mvp");
    const mvp = mvpParam === "true" ? true : mvpParam === "false" ? false : undefined;

    const indicators = await listIndicators(db, { category, mvp });
    return success(c, indicators);
  });

  return router;
}
