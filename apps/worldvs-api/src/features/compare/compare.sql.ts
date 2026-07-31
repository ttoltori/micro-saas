import type { DatabaseClient } from "@worldvs/database";
import { getCountry, toCountry, type CountryRow } from "../country/country.sql.js";
import { listIndicators, type IndicatorRow } from "../indicator/indicator.sql.js";
import type { Country } from "@worldvs/api-contracts";

interface ValueRow {
  country_code: string;
  indicator_id: string;
  value: number | null;
  text_value: string | null;
  year: number | null;
  source_name: string;
}

interface CompareResultItem {
  indicator: {
    id: string;
    category: string;
    nameKo: string;
    nameEn: string;
    unit: string;
    descriptionKo: string | null;
    sourceName: string;
    sourceUrl: string | null;
    higherIsBetter: boolean | null;
    displayType: string;
    decimalPlaces: number;
    isMvp: boolean;
    sortOrder: number;
  };
  leftValue: { value: number | null; textValue: string | null; year: number | null; sourceName: string } | null;
  rightValue: { value: number | null; textValue: string | null; year: number | null; sourceName: string } | null;
  leftGauge: number;
  rightGauge: number;
  winner: "LEFT" | "RIGHT" | "DRAW" | "UNKNOWN";
  summaryText: string;
}

interface Badge {
  emoji: string;
  label: string;
}

interface ScoreSummary {
  leftWins: number;
  rightWins: number;
  draws: number;
  unknowns: number;
  summaryText: string;
}

export interface CompareResult {
  leftCountry: Country;
  rightCountry: Country;
  results: CompareResultItem[];
  scoreSummary: ScoreSummary;
  badges: { left: Badge[]; right: Badge[] };
}

function calculateGauge(left: number | null, right: number | null): [number, number] {
  if (left == null || right == null) return [0, 0];
  if (left <= 0 && right <= 0) return [0, 0];
  const max = Math.max(left, right);
  if (max === 0) return [0, 0];
  return [(left / max) * 100, (right / max) * 100];
}

function generateSummary(
  leftName: string,
  rightName: string,
  leftValue: number | null,
  rightValue: number | null,
): string {
  if (leftValue == null || rightValue == null) {
    return "데이터가 부족해 비교할 수 없어요.";
  }
  if (leftValue === 0 && rightValue === 0) {
    return "두 나라 모두 값이 0입니다.";
  }

  const [biggerName, smallerName, biggerValue, smallerValue] =
    leftValue >= rightValue
      ? [leftName, rightName, leftValue, rightValue]
      : [rightName, leftName, rightValue, leftValue];

  if (smallerValue === 0) {
    return `${biggerName} 쪽 값이 더 높습니다.`;
  }

  const ratio = biggerValue / smallerValue;

  if (ratio >= 2.0) {
    return `${biggerName}이/가 ${smallerName}보다 약 ${ratio.toFixed(1)}배 높아요.`;
  }
  if (ratio >= 1.15) {
    return `${biggerName}이/가 ${smallerName}보다 약 ${Math.round((ratio - 1) * 100)}% 높아요.`;
  }
  return "두 나라가 거의 비슷해요.";
}

function determineWinner(left: number | null, right: number | null): "LEFT" | "RIGHT" | "DRAW" | "UNKNOWN" {
  if (left == null || right == null) return "UNKNOWN";
  if (left === right) return "DRAW";
  return left > right ? "LEFT" : "RIGHT";
}

function calculateBadges(values: Map<string, ValueRow>): Badge[] {
  const badges: Badge[] = [];

  const internet = values.get("internet_penetration");
  if (internet && internet.value != null && internet.value >= 90) {
    badges.push({ emoji: "📱", label: "디지털 강국" });
  }

  const density = values.get("population_density");
  if (density && density.value != null && density.value >= 300) {
    badges.push({ emoji: "🏙", label: "고밀도 국가" });
  }

  const life = values.get("life_expectancy");
  if (life && life.value != null && life.value >= 82) {
    badges.push({ emoji: "👴", label: "장수 국가" });
  }

  const defense = values.get("defense_budget");
  if (defense && defense.value != null && defense.value >= 50000000000) {
    badges.push({ emoji: "⚔", label: "방위력 집중" });
  }

  const naval = values.get("naval_vessels");
  if (naval && naval.value != null && naval.value >= 150) {
    badges.push({ emoji: "🌊", label: "해양 국가" });
  }

  return badges;
}

export async function getComparison(
  db: DatabaseClient,
  leftCode: string,
  rightCode: string,
): Promise<CompareResult> {
  const left = await getCountry(db, leftCode);
  const right = await getCountry(db, rightCode);

  if (!left) throw new Error(`Country not found: ${leftCode}`);
  if (!right) throw new Error(`Country not found: ${rightCode}`);

  const indicators = await listIndicators(db, { mvp: true });

  const valuesResult = await db.query<ValueRow>(
    `SELECT country_code, indicator_id, value, text_value, year, source_name
     FROM worldvs.country_indicator_values
     WHERE country_code IN ($1, $2) AND indicator_id = ANY($3::text[])`,
    [left.code, right.code, indicators.map((i) => i.id)],
  );

  const leftValues = new Map<string, ValueRow>();
  const rightValues = new Map<string, ValueRow>();
  for (const row of valuesResult.rows) {
    if (row.country_code === left.code) leftValues.set(row.indicator_id, row);
    if (row.country_code === right.code) rightValues.set(row.indicator_id, row);
  }

  const results: CompareResultItem[] = [];
  let leftWins = 0;
  let rightWins = 0;
  let draws = 0;
  let unknowns = 0;

  for (const ind of indicators) {
    const lv = leftValues.get(ind.id);
    const rv = rightValues.get(ind.id);
    const leftNum = lv?.value != null ? Number(lv.value) : null;
    const rightNum = rv?.value != null ? Number(rv.value) : null;

    const [leftGauge, rightGauge] = calculateGauge(leftNum, rightNum);
    const winner = determineWinner(leftNum, rightNum);
    const summaryText = ind.display_type === "TEXT"
      ? generateTextSummary(left.name_ko, right.name_ko, lv?.text_value ?? null, rv?.text_value ?? null)
      : generateSummary(left.name_ko, right.name_ko, leftNum, rightNum);

    if (winner === "LEFT") leftWins++;
    else if (winner === "RIGHT") rightWins++;
    else if (winner === "DRAW") draws++;
    else unknowns++;

    results.push({
      indicator: {
        id: ind.id,
        category: ind.category,
        nameKo: ind.name_ko,
        nameEn: ind.name_en,
        unit: ind.unit,
        descriptionKo: ind.description_ko,
        sourceName: ind.source_name,
        sourceUrl: ind.source_url,
        higherIsBetter: ind.higher_is_better,
        displayType: ind.display_type,
        decimalPlaces: ind.decimal_places,
        isMvp: ind.is_mvp,
        sortOrder: ind.sort_order,
      },
      leftValue: lv ? { value: leftNum, textValue: lv.text_value, year: lv.year, sourceName: lv.source_name } : null,
      rightValue: rv ? { value: rightNum, textValue: rv.text_value, year: rv.year, sourceName: rv.source_name } : null,
      leftGauge,
      rightGauge,
      winner,
      summaryText,
    });
  }

  const scoreSummary: ScoreSummary = {
    leftWins,
    rightWins,
    draws,
    unknowns,
    summaryText:
      leftWins > rightWins
        ? `${left.name_ko}이/가 더 높은 값을 가진 항목이 많아요.`
        : rightWins > leftWins
          ? `${right.name_ko}이/가 더 높은 값을 가진 항목이 많아요.`
          : "두 나라가 비슷한 수치를 보여요.",
  };

  return {
    leftCountry: toCountry(left),
    rightCountry: toCountry(right),
    results,
    scoreSummary,
    badges: {
      left: calculateBadges(leftValues),
      right: calculateBadges(rightValues),
    },
  };
}

function generateTextSummary(
  leftName: string,
  rightName: string,
  leftVal: string | null,
  rightVal: string | null,
): string {
  if (!leftVal && !rightVal) return "데이터가 부족해 비교할 수 없어요.";
  if (!leftVal) return `${rightName}의 수도는 ${rightVal}입니다.`;
  if (!rightVal) return `${leftName}의 수도는 ${leftVal}입니다.`;
  if (leftVal === rightVal) return "두 나라의 수도 이름이 같아요.";
  return `${leftName}의 수도는 ${leftVal}, ${rightName}의 수도는 ${rightVal}입니다.`;
}

export async function logCompareView(
  db: DatabaseClient,
  leftCode: string,
  rightCode: string,
): Promise<void> {
  await db.query(
    `INSERT INTO worldvs.compare_views (left_country_code, right_country_code) VALUES ($1, $2)`,
    [leftCode.toUpperCase(), rightCode.toUpperCase()],
  );
}

export async function getTrending(
  db: DatabaseClient,
  limit: number = 10,
): Promise<Array<{
  leftCountryCode: string;
  rightCountryCode: string;
  leftCountryName: string;
  rightCountryName: string;
  leftFlagEmoji: string;
  rightFlagEmoji: string;
  viewCount: number;
}>> {
  const result = await db.query(
    `SELECT
       cv.left_country_code,
       cv.right_country_code,
       lc.name_ko as left_country_name,
       rc.name_ko as right_country_name,
       lc.flag_emoji as left_flag_emoji,
       rc.flag_emoji as right_flag_emoji,
       COUNT(*) as view_count
     FROM worldvs.compare_views cv
     JOIN worldvs.countries lc ON lc.code = cv.left_country_code
     JOIN worldvs.countries rc ON rc.code = cv.right_country_code
     WHERE cv.created_at > NOW() - INTERVAL '7 days'
     GROUP BY cv.left_country_code, cv.right_country_code, lc.name_ko, rc.name_ko, lc.flag_emoji, rc.flag_emoji
     ORDER BY view_count DESC
     LIMIT $1`,
    [limit],
  );
  return result.rows.map((r: Record<string, unknown>) => ({
    leftCountryCode: r.left_country_code as string,
    rightCountryCode: r.right_country_code as string,
    leftCountryName: r.left_country_name as string,
    rightCountryName: r.right_country_name as string,
    leftFlagEmoji: (r.left_flag_emoji as string) ?? "",
    rightFlagEmoji: (r.right_flag_emoji as string) ?? "",
    viewCount: Number(r.view_count),
  }));
}

export async function getDailyCompare(
  db: DatabaseClient,
): Promise<{
  leftCountryCode: string;
  rightCountryCode: string;
  leftCountryName: string;
  rightCountryName: string;
  leftFlagEmoji: string;
  rightFlagEmoji: string;
  theme: string;
}> {
  const countriesResult = await db.query<{ code: string; name_ko: string; flag_emoji: string | null }>(
    `SELECT code, name_ko, flag_emoji FROM worldvs.countries WHERE is_active = true ORDER BY code`,
  );
  const codes = countriesResult.rows;
  if (codes.length < 2) throw new Error("Not enough countries");

  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const idx1 = seed % codes.length;
  let idx2 = Math.floor(seed / codes.length) % codes.length;
  if (idx2 === idx1) idx2 = (idx2 + 1) % codes.length;

  const left = codes[idx1];
  const right = codes[idx2];

  return {
    leftCountryCode: left.code,
    rightCountryCode: right.code,
    leftCountryName: left.name_ko,
    rightCountryName: right.name_ko,
    leftFlagEmoji: left.flag_emoji ?? "",
    rightFlagEmoji: right.flag_emoji ?? "",
    theme: "오늘의 비교",
  };
}
