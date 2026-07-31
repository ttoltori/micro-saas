import type { DatabaseClient } from "@worldvs/database";
import type { Country } from "@worldvs/api-contracts";

export interface CountryRow {
  code: string;
  iso3: string;
  name_ko: string;
  name_en: string;
  name_ja: string | null;
  flag_emoji: string | null;
  capital_ko: string | null;
  capital_en: string | null;
  region: string;
  subregion: string | null;
}

export function toCountry(row: CountryRow): Country {
  return {
    code: row.code,
    iso3: row.iso3,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    nameJa: row.name_ja,
    flagEmoji: row.flag_emoji,
    capitalKo: row.capital_ko,
    capitalEn: row.capital_en,
    region: row.region,
    subregion: row.subregion,
  };
}

export async function listCountries(
  db: DatabaseClient,
  params: { region?: string; q?: string; page?: number; pageSize?: number },
): Promise<{ items: CountryRow[]; total: number; page: number; pageSize: number }> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 30;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = ["is_active = true"];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (params.region) {
    conditions.push(`region = $${paramIdx++}`);
    values.push(params.region);
  }
  if (params.q) {
    conditions.push(`(name_ko ILIKE $${paramIdx} OR name_en ILIKE $${paramIdx})`);
    values.push(`%${params.q}%`);
    paramIdx++;
  }

  const where = conditions.join(" AND ");

  const countResult = await db.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM worldvs.countries WHERE ${where}`,
    values,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await db.query<CountryRow>(
    `SELECT code, iso3, name_ko, name_en, name_ja, flag_emoji, capital_ko, capital_en, region, subregion
     FROM worldvs.countries WHERE ${where}
     ORDER BY name_ko ASC
     LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
    [...values, pageSize, offset],
  );

  return { items: result.rows, total, page, pageSize };
}

export async function getCountry(db: DatabaseClient, code: string): Promise<CountryRow | null> {
  const result = await db.query<CountryRow>(
    `SELECT code, iso3, name_ko, name_en, name_ja, flag_emoji, capital_ko, capital_en, region, subregion
     FROM worldvs.countries WHERE code = $1 AND is_active = true`,
    [code.toUpperCase()],
  );
  return result.rows[0] ?? null;
}

export async function getRecommendations(
  db: DatabaseClient,
  code: string,
): Promise<CountryRow[]> {
  const result = await db.query<CountryRow>(
    `SELECT DISTINCT c.code, c.iso3, c.name_ko, c.name_en, c.name_ja, c.flag_emoji, c.capital_ko, c.capital_en, c.region, c.subregion
     FROM worldvs.compare_views cv
     JOIN worldvs.countries c ON c.code = CASE WHEN cv.left_country_code = $1 THEN cv.right_country_code ELSE cv.left_country_code END
     WHERE (cv.left_country_code = $1 OR cv.right_country_code = $1) AND c.code != $1 AND c.is_active = true
     GROUP BY c.code
     ORDER BY COUNT(*) DESC
     LIMIT 5`,
    [code.toUpperCase()],
  );

  if (result.rows.length < 5) {
    const existing = new Set(result.rows.map((r) => r.code));
    existing.add(code.toUpperCase());
    const placeholders = Array.from(existing, (_, i) => `$${i + 1}`).join(",");
    const fallback = await db.query<CountryRow>(
      `SELECT code, iso3, name_ko, name_en, name_ja, flag_emoji, capital_ko, capital_en, region, subregion
       FROM worldvs.countries WHERE is_active = true AND code NOT IN (${placeholders})
       ORDER BY name_ko ASC LIMIT $${existing.size + 1}`,
      [...existing, 5 - result.rows.length],
    );
    return [...result.rows, ...fallback.rows];
  }

  return result.rows;
}
