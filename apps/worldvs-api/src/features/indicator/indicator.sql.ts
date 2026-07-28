import type { DatabaseClient } from "@worldvs/database";

export interface IndicatorRow {
  id: string;
  category: string;
  name_ko: string;
  name_en: string;
  unit: string;
  description_ko: string | null;
  source_name: string;
  source_url: string | null;
  higher_is_better: boolean | null;
  display_type: string;
  decimal_places: number;
  is_mvp: boolean;
  sort_order: number;
}

export async function listIndicators(
  db: DatabaseClient,
  params: { category?: string; mvp?: boolean },
): Promise<IndicatorRow[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (params.category) {
    conditions.push(`category = $${paramIdx++}`);
    values.push(params.category);
  }
  if (params.mvp !== undefined) {
    conditions.push(`is_mvp = $${paramIdx++}`);
    values.push(params.mvp);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.query<IndicatorRow>(
    `SELECT id, category, name_ko, name_en, unit, description_ko, source_name, source_url,
            higher_is_better, display_type, decimal_places, is_mvp, sort_order
     FROM worldvs.indicators ${where}
     ORDER BY sort_order ASC`,
    values,
  );

  return result.rows;
}
