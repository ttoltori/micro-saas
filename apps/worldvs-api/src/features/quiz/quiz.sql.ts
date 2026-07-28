import type { DatabaseClient } from "@worldvs/database";
import { randomUUID } from "crypto";

interface QuestionRow {
  id: string;
  type: string;
  difficulty: string;
  category: string;
  question_ko: string;
  correct_option_id: string;
  explanation_ko: string | null;
  related_indicator_id: string | null;
}

interface OptionRow {
  question_id: string;
  option_id: string;
  text_ko: string;
  sort_order: number;
}

export interface QuizSessionData {
  sessionId: string;
  questions: Array<{
    id: string;
    type: string;
    difficulty: string;
    category: string;
    questionText: string;
    options: Array<{ id: string; text: string }>;
    relatedIndicatorId: string | null;
  }>;
}

export async function generateQuizSession(
  db: DatabaseClient,
  params: { mode?: string; category?: string | null; difficulty?: string | null },
): Promise<QuizSessionData> {
  const mode = params.mode ?? "DAILY_10";
  const questionCount = 10;

  const conditions: string[] = ["is_active = true"];
  const values: unknown[] = [];
  let paramIdx = 1;

  if (params.category) {
    conditions.push(`category = $${paramIdx++}`);
    values.push(params.category);
  }
  if (params.difficulty) {
    conditions.push(`difficulty = $${paramIdx++}`);
    values.push(params.difficulty);
  }

  const where = conditions.join(" AND ");

  const questionsResult = await db.query<QuestionRow>(
    `SELECT id, type, difficulty, category, question_ko, correct_option_id, explanation_ko, related_indicator_id
     FROM worldvs.quiz_questions WHERE ${where}
     ORDER BY RANDOM()
     LIMIT $${paramIdx++}`,
    [...values, questionCount],
  );

  if (questionsResult.rows.length === 0) {
    throw new Error("No quiz questions found matching criteria");
  }

  const questionIds = questionsResult.rows.map((q) => q.id);
  const optionsResult = await db.query<OptionRow>(
    `SELECT question_id, option_id, text_ko, sort_order
     FROM worldvs.quiz_options WHERE question_id = ANY($1::text[])
     ORDER BY question_id, sort_order`,
    [questionIds],
  );

  const optionsMap = new Map<string, OptionRow[]>();
  for (const opt of optionsResult.rows) {
    if (!optionsMap.has(opt.question_id)) optionsMap.set(opt.question_id, []);
    optionsMap.get(opt.question_id)!.push(opt);
  }

  const sessionId = `qs_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

  await db.query(
    `INSERT INTO worldvs.quiz_sessions (id, mode, category, difficulty, question_count) VALUES ($1, $2, $3, $4, $5)`,
    [sessionId, mode, params.category ?? null, params.difficulty ?? null, questionsResult.rows.length],
  );

  for (let i = 0; i < questionsResult.rows.length; i++) {
    await db.query(
      `INSERT INTO worldvs.quiz_session_questions (session_id, question_id, sort_order) VALUES ($1, $2, $3)`,
      [sessionId, questionsResult.rows[i].id, i],
    );
  }

  const questions = questionsResult.rows.map((q) => ({
    id: q.id,
    type: q.type,
    difficulty: q.difficulty,
    category: q.category,
    questionText: q.question_ko,
    options: (optionsMap.get(q.id) ?? []).map((o) => ({
      id: o.option_id,
      text: o.text_ko,
    })),
    relatedIndicatorId: q.related_indicator_id,
  }));

  return { sessionId, questions };
}

export async function getQuizSession(
  db: DatabaseClient,
  sessionId: string,
): Promise<QuizSessionData> {
  const sessionResult = await db.query<{ id: string; submitted_at: string | null }>(
    `SELECT id, submitted_at FROM worldvs.quiz_sessions WHERE id = $1`,
    [sessionId],
  );

  if (sessionResult.rows.length === 0) {
    throw new Error("QUIZ_SESSION_NOT_FOUND");
  }

  const questionsResult = await db.query<QuestionRow>(
    `SELECT q.id, q.type, q.difficulty, q.category, q.question_ko, q.correct_option_id, q.explanation_ko, q.related_indicator_id
     FROM worldvs.quiz_session_questions qsq
     JOIN worldvs.quiz_questions q ON q.id = qsq.question_id
     WHERE qsq.session_id = $1
     ORDER BY qsq.sort_order`,
    [sessionId],
  );

  if (questionsResult.rows.length === 0) {
    const fallback = await db.query<QuestionRow>(
      `SELECT id, type, difficulty, category, question_ko, correct_option_id, explanation_ko, related_indicator_id
       FROM worldvs.quiz_questions WHERE is_active = true ORDER BY RANDOM() LIMIT 10`,
    );
    if (fallback.rows.length === 0) throw new Error("QUIZ_SESSION_NOT_FOUND");
    const questionIds = fallback.rows.map((q) => q.id);
    const optionsResult = await db.query<OptionRow>(
      `SELECT question_id, option_id, text_ko, sort_order FROM worldvs.quiz_options WHERE question_id = ANY($1::text[]) ORDER BY question_id, sort_order`,
      [questionIds],
    );
    const optionsMap = new Map<string, OptionRow[]>();
    for (const opt of optionsResult.rows) {
      if (!optionsMap.has(opt.question_id)) optionsMap.set(opt.question_id, []);
      optionsMap.get(opt.question_id)!.push(opt);
    }
    return {
      sessionId,
      questions: fallback.rows.map((q) => ({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        category: q.category,
        questionText: q.question_ko,
        options: (optionsMap.get(q.id) ?? []).map((o) => ({ id: o.option_id, text: o.text_ko })),
        relatedIndicatorId: q.related_indicator_id,
      })),
    };
  }

  const questionIds = questionsResult.rows.map((q) => q.id);
  const optionsResult = await db.query<OptionRow>(
    `SELECT question_id, option_id, text_ko, sort_order FROM worldvs.quiz_options WHERE question_id = ANY($1::text[]) ORDER BY question_id, sort_order`,
    [questionIds],
  );
  const optionsMap = new Map<string, OptionRow[]>();
  for (const opt of optionsResult.rows) {
    if (!optionsMap.has(opt.question_id)) optionsMap.set(opt.question_id, []);
    optionsMap.get(opt.question_id)!.push(opt);
  }

  return {
    sessionId,
    questions: questionsResult.rows.map((q) => ({
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      category: q.category,
      questionText: q.question_ko,
      options: (optionsMap.get(q.id) ?? []).map((o) => ({ id: o.option_id, text: o.text_ko })),
      relatedIndicatorId: q.related_indicator_id,
    })),
  };
}

export interface QuizResultData {
  resultId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSeconds: number;
  title: string;
  titleEmoji: string;
  details: Array<{
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    explanation: string;
  }>;
  leaderboardEligible: boolean;
}

function getTitle(score: number): { title: string; titleEmoji: string } {
  if (score <= 30) return { title: "지구 초보자", titleEmoji: "🌱" };
  if (score <= 60) return { title: "세계 산책자", titleEmoji: "🚶" };
  if (score <= 80) return { title: "국가 비교 고수", titleEmoji: "🌍" };
  return { title: "외교관급 감각", titleEmoji: "🕊️" };
}

export async function submitQuizResult(
  db: DatabaseClient,
  sessionId: string,
  answers: Array<{ questionId: string; selectedOptionId: string; durationMs?: number }>,
  totalDurationSeconds: number,
): Promise<QuizResultData> {
  const sessionResult = await db.query<{ id: string; submitted_at: string | null; mode: string }>(
    `SELECT id, submitted_at, mode FROM worldvs.quiz_sessions WHERE id = $1`,
    [sessionId],
  );

  if (sessionResult.rows.length === 0) {
    throw new Error("QUIZ_SESSION_NOT_FOUND");
  }
  if (sessionResult.rows[0].submitted_at) {
    throw new Error("QUIZ_SESSION_ALREADY_SUBMITTED");
  }

  const questionIds = answers.map((a) => a.questionId);
  const questionsResult = await db.query<QuestionRow>(
    `SELECT id, type, difficulty, category, question_ko, correct_option_id, explanation_ko, related_indicator_id
     FROM worldvs.quiz_questions WHERE id = ANY($1::text[])`,
    [questionIds],
  );

  const questionMap = new Map(questionsResult.rows.map((q) => [q.id, q]));

  let correctCount = 0;
  const details: QuizResultData["details"] = [];

  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) continue;

    const isCorrect = answer.selectedOptionId === question.correct_option_id;
    if (isCorrect) correctCount++;

    details.push({
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      correctOptionId: question.correct_option_id,
      isCorrect,
      explanation: question.explanation_ko ?? "",
    });
  }

  const totalQuestions = answers.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const { title, titleEmoji } = getTitle(score);
  const resultId = `qr_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

  await db.transaction(async (tx) => {
    await tx.query(
      `INSERT INTO worldvs.quiz_results (id, session_id, score, correct_count, total_questions, duration_seconds, title, title_emoji)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [resultId, sessionId, score, correctCount, totalQuestions, totalDurationSeconds, title, titleEmoji],
    );

    for (let i = 0; i < details.length; i++) {
      const d = details[i];
      const q = questionMap.get(d.questionId);
      await tx.query(
        `INSERT INTO worldvs.quiz_answer_logs (result_id, question_id, category, difficulty, selected_option_id, correct_option_id, is_correct, duration_ms)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [resultId, d.questionId, q?.category ?? null, q?.difficulty ?? null, d.selectedOptionId, d.correctOptionId, d.isCorrect, answers[i].durationMs ?? null],
      );
    }

    await tx.query(
      `UPDATE worldvs.quiz_sessions SET submitted_at = NOW() WHERE id = $1`,
      [sessionId],
    );
  });

  const eligibilityResult = await db.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM worldvs.leaderboard`,
  );
  const totalEntries = parseInt(eligibilityResult.rows[0].count, 10);
  let eligible = false;

  if (totalEntries < 100) {
    eligible = true;
  } else {
    const minResult = await db.query<{ score: number; duration_seconds: number }>(
      `SELECT score, duration_seconds FROM worldvs.leaderboard ORDER BY score DESC, duration_seconds ASC, created_at ASC LIMIT 100`,
    );
    if (minResult.rows.length >= 100) {
      const minEntry = minResult.rows[99];
      eligible = score > minEntry.score || (score === minEntry.score && totalDurationSeconds < minEntry.duration_seconds);
    }
  }

  return {
    resultId,
    score,
    correctCount,
    totalQuestions,
    durationSeconds: totalDurationSeconds,
    title,
    titleEmoji,
    details,
    leaderboardEligible: eligible,
  };
}

export async function getQuizResult(
  db: DatabaseClient,
  resultId: string,
): Promise<QuizResultData> {
  const resultRow = await db.query<{
    id: string;
    score: number;
    correct_count: number;
    total_questions: number;
    duration_seconds: number;
    title: string;
    title_emoji: string;
  }>(
    `SELECT id, score, correct_count, total_questions, duration_seconds, title, title_emoji
     FROM worldvs.quiz_results WHERE id = $1`,
    [resultId],
  );

  if (resultRow.rows.length === 0) {
    throw new Error("QUIZ_RESULT_NOT_FOUND");
  }

  const r = resultRow.rows[0];

  const logsResult = await db.query<{
    question_id: string;
    selected_option_id: string;
    correct_option_id: string;
    is_correct: boolean;
  }>(
    `SELECT question_id, selected_option_id, correct_option_id, is_correct
     FROM worldvs.quiz_answer_logs WHERE result_id = $1`,
    [resultId],
  );

  const questionIds = logsResult.rows.map((l) => l.question_id);
  const questionsResult = await db.query<{ id: string; explanation_ko: string | null }>(
    `SELECT id, explanation_ko FROM worldvs.quiz_questions WHERE id = ANY($1::text[])`,
    [questionIds],
  );
  const explanationMap = new Map(questionsResult.rows.map((q) => [q.id, q.explanation_ko ?? ""]));

  return {
    resultId: r.id,
    score: r.score,
    correctCount: r.correct_count,
    totalQuestions: r.total_questions,
    durationSeconds: r.duration_seconds,
    title: r.title,
    titleEmoji: r.title_emoji,
    details: logsResult.rows.map((l) => ({
      questionId: l.question_id,
      selectedOptionId: l.selected_option_id,
      correctOptionId: l.correct_option_id,
      isCorrect: l.is_correct,
      explanation: explanationMap.get(l.question_id) ?? "",
    })),
    leaderboardEligible: false,
  };
}
