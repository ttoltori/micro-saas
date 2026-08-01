import type { DatabaseClient } from "@worldvs/database";
import { createHash } from "crypto";

export interface LeaderboardEntryRow {
  rank: number;
  playerName: string;
  nationalityCode: string;
  nationalityName: string;
  nationalityFlagEmoji: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSeconds: number;
  quizMode: string;
  createdAt: string;
}

export async function getLeaderboard(
  db: DatabaseClient,
  limit: number = 100,
): Promise<{ items: LeaderboardEntryRow[]; total: number }> {
  const countResult = await db.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM worldvs.leaderboard`,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const result = await db.query(
    `SELECT
       l.player_name,
       l.nationality_code,
       c.name_ko as nationality_name,
       c.flag_emoji as nationality_flag_emoji,
       l.score,
       l.correct_count,
       l.total_questions,
       l.duration_seconds,
       l.quiz_mode,
       l.created_at
     FROM worldvs.leaderboard l
     JOIN worldvs.countries c ON c.code = l.nationality_code
     ORDER BY l.score DESC, l.duration_seconds ASC, l.created_at ASC
     LIMIT $1`,
    [limit],
  );

  const items: LeaderboardEntryRow[] = result.rows.map((row: Record<string, unknown>, idx: number) => ({
    rank: idx + 1,
    playerName: row.player_name as string,
    nationalityCode: row.nationality_code as string,
    nationalityName: row.nationality_name as string,
    nationalityFlagEmoji: (row.nationality_flag_emoji as string) ?? "",
    score: row.score as number,
    correctCount: row.correct_count as number,
    totalQuestions: row.total_questions as number,
    durationSeconds: row.duration_seconds as number,
    quizMode: row.quiz_mode as string,
    createdAt: row.created_at as string,
  }));

  return { items, total };
}

export async function checkEligibility(
  db: DatabaseClient,
  score: number,
  durationSeconds: number,
): Promise<{
  eligible: boolean;
  currentMinScore: number | null;
  currentMinDurationSeconds: number | null;
  totalEntries: number;
}> {
  const countResult = await db.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM worldvs.leaderboard`,
  );
  const totalEntries = parseInt(countResult.rows[0].count, 10);

  if (totalEntries < 100) {
    return { eligible: true, currentMinScore: null, currentMinDurationSeconds: null, totalEntries };
  }

  const minResult = await db.query<{ score: number; duration_seconds: number }>(
    `SELECT score, duration_seconds FROM worldvs.leaderboard
     ORDER BY score DESC, duration_seconds ASC, created_at ASC
     LIMIT 100`,
  );

  const minEntry = minResult.rows[99];
  const eligible =
    score > minEntry.score ||
    (score === minEntry.score && durationSeconds < minEntry.duration_seconds);

  return {
    eligible,
    currentMinScore: minEntry.score,
    currentMinDurationSeconds: minEntry.duration_seconds,
    totalEntries,
  };
}

export async function getPotentialRank(
  db: DatabaseClient,
  score: number,
  durationSeconds: number,
): Promise<{ rank: number; totalEntries: number }> {
  const countResult = await db.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM worldvs.leaderboard`,
  );
  const totalEntries = parseInt(countResult.rows[0].count, 10);

  const rankResult = await db.query<{ rank: string }>(
    `SELECT COUNT(*) + 1 as rank FROM worldvs.leaderboard
     WHERE score > $1 OR (score = $1 AND duration_seconds < $2)`,
    [score, durationSeconds],
  );

  return {
    rank: parseInt(rankResult.rows[0].rank, 10),
    totalEntries,
  };
}

export async function submitScore(
  db: DatabaseClient,
  params: { resultId: string; playerName: string; nationalityCode: string; deviceId?: string },
): Promise<{ rank: number; playerName: string; nationalityCode: string; score: number; durationSeconds: number }> {
  const resultRow = await db.query<{
    id: string;
    score: number;
    correct_count: number;
    total_questions: number;
    duration_seconds: number;
    session_id: string;
  }>(
    `SELECT qr.id, qr.score, qr.correct_count, qr.total_questions, qr.duration_seconds, qr.session_id
     FROM worldvs.quiz_results qr WHERE qr.id = $1`,
    [params.resultId],
  );

  if (resultRow.rows.length === 0) {
    throw new Error("QUIZ_RESULT_NOT_FOUND");
  }

  const result = resultRow.rows[0];

  const sessionRow = await db.query<{ mode: string }>(
    `SELECT mode FROM worldvs.quiz_sessions WHERE id = $1`,
    [result.session_id],
  );
  const quizMode = sessionRow.rows[0]?.mode ?? "DAILY_10";

  const deviceIdHash = params.deviceId
    ? createHash("sha256").update(params.deviceId).digest("hex")
    : null;

  await db.query(
    `INSERT INTO worldvs.leaderboard
       (quiz_result_id, player_name, nationality_code, score, correct_count, total_questions, duration_seconds, quiz_mode, device_id_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      params.resultId,
      params.playerName,
      params.nationalityCode.toUpperCase(),
      result.score,
      result.correct_count,
      result.total_questions,
      result.duration_seconds,
      quizMode,
      deviceIdHash,
    ],
  );

  const rankResult = await db.query<{ rank: string }>(
    `SELECT COUNT(*) + 1 as rank FROM worldvs.leaderboard
     WHERE score > $1 OR (score = $1 AND duration_seconds < $2) OR (score = $1 AND duration_seconds = $2 AND created_at < (SELECT created_at FROM worldvs.leaderboard WHERE quiz_result_id = $3))`,
    [result.score, result.duration_seconds, params.resultId],
  );

  return {
    rank: parseInt(rankResult.rows[0].rank, 10),
    playerName: params.playerName,
    nationalityCode: params.nationalityCode.toUpperCase(),
    score: result.score,
    durationSeconds: result.duration_seconds,
  };
}
