import { Hono } from "hono";
import type { DatabaseClient } from "@worldvs/database";
import { listCountries, getCountry, getRecommendations, toCountry } from "../features/country/country.sql.js";
import { success, paginated, error } from "../utils/response.js";
import { notFound } from "../errors/error-codes.js";

export function createCountryRoutes(db: DatabaseClient) {
  const router = new Hono();

  router.get("/", async (c) => {
    const region = c.req.query("region");
    const q = c.req.query("q");
    const page = parseInt(c.req.query("page") ?? "1", 10);
    const pageSize = parseInt(c.req.query("pageSize") ?? "30", 10);

    const result = await listCountries(db, { region, q, page, pageSize });
    return paginated(c, result.items.map(toCountry), result.total, result.page, result.pageSize);
  });

  router.get("/:code", async (c) => {
    const code = c.req.param("code");
    const country = await getCountry(db, code);
    if (!country) return error(c, notFound("COUNTRY_NOT_FOUND", `국가를 찾을 수 없습니다: ${code}`));
    return success(c, toCountry(country));
  });

  router.get("/:code/recommendations", async (c) => {
    const code = c.req.param("code");
    const country = await getCountry(db, code);
    if (!country) return error(c, notFound("COUNTRY_NOT_FOUND", `국가를 찾을 수 없습니다: ${code}`));
    const recs = await getRecommendations(db, code);
    return success(c, recs.map(toCountry));
  });

  return router;
}
