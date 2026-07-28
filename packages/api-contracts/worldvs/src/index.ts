import { z } from "zod";

// ── Common ──────────────────────────────────────────────

export const successResponseSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.literal(true),
    data,
    meta: z.object({ requestId: z.string() }).optional(),
  });

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().nullable(),
  }),
  meta: z.object({ requestId: z.string() }).optional(),
});

export const paginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

// ── Country ─────────────────────────────────────────────

export const countrySchema = z.object({
  code: z.string(),
  iso3: z.string(),
  nameKo: z.string(),
  nameEn: z.string(),
  nameJa: z.string().nullable(),
  flagEmoji: z.string().nullable(),
  capitalKo: z.string().nullable(),
  capitalEn: z.string().nullable(),
  region: z.string(),
  subregion: z.string().nullable(),
});

export const countryListResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(countrySchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  }),
});

// ── Indicator ───────────────────────────────────────────

export const indicatorSchema = z.object({
  id: z.string(),
  category: z.string(),
  nameKo: z.string(),
  nameEn: z.string(),
  unit: z.string(),
  descriptionKo: z.string().nullable(),
  sourceName: z.string(),
  sourceUrl: z.string().nullable(),
  higherIsBetter: z.boolean().nullable(),
  displayType: z.string(),
  decimalPlaces: z.number(),
  isMvp: z.boolean(),
  sortOrder: z.number(),
});

// ── Compare ─────────────────────────────────────────────

export const compareWinnerSchema = z.enum(["LEFT", "RIGHT", "DRAW", "UNKNOWN"]);

export const indicatorValueSchema = z.object({
  value: z.number().nullable(),
  textValue: z.string().nullable(),
  year: z.number().nullable(),
  sourceName: z.string(),
});

export const compareResultItemSchema = z.object({
  indicator: indicatorSchema,
  leftValue: indicatorValueSchema.nullable(),
  rightValue: indicatorValueSchema.nullable(),
  leftGauge: z.number(),
  rightGauge: z.number(),
  winner: compareWinnerSchema,
  summaryText: z.string(),
});

export const badgeSchema = z.object({
  emoji: z.string(),
  label: z.string(),
});

export const scoreSummarySchema = z.object({
  leftWins: z.number(),
  rightWins: z.number(),
  draws: z.number(),
  unknowns: z.number(),
  summaryText: z.string(),
});

export const compareResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    leftCountry: countrySchema,
    rightCountry: countrySchema,
    results: z.array(compareResultItemSchema),
    scoreSummary: scoreSummarySchema,
    badges: z.object({
      left: z.array(badgeSchema),
      right: z.array(badgeSchema),
    }),
  }),
});

export const trendingItemSchema = z.object({
  leftCountryCode: z.string(),
  rightCountryCode: z.string(),
  leftCountryName: z.string(),
  rightCountryName: z.string(),
  leftFlagEmoji: z.string(),
  rightFlagEmoji: z.string(),
  viewCount: z.number(),
});

export const dailyCompareSchema = z.object({
  leftCountryCode: z.string(),
  rightCountryCode: z.string(),
  leftCountryName: z.string(),
  rightCountryName: z.string(),
  leftFlagEmoji: z.string(),
  rightFlagEmoji: z.string(),
  theme: z.string(),
});

// ── Quiz ────────────────────────────────────────────────

export const quizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const quizQuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  difficulty: z.string(),
  category: z.string(),
  questionText: z.string(),
  options: z.array(quizOptionSchema),
  relatedIndicatorId: z.string().nullable(),
});

export const createQuizSessionRequestSchema = z.object({
  mode: z.string().default("DAILY_10"),
  category: z.string().nullable().default(null),
  difficulty: z.string().nullable().default(null),
});

export const quizSessionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    sessionId: z.string(),
    questions: z.array(quizQuestionSchema),
  }),
});

export const quizAnswerSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
  durationMs: z.number().optional(),
});

export const submitQuizRequestSchema = z.object({
  answers: z.array(quizAnswerSchema),
  totalDurationSeconds: z.number(),
});

export const quizDetailSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
  correctOptionId: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string(),
});

export const quizResultResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    resultId: z.string(),
    score: z.number(),
    correctCount: z.number(),
    totalQuestions: z.number(),
    durationSeconds: z.number(),
    title: z.string(),
    titleEmoji: z.string(),
    details: z.array(quizDetailSchema),
    leaderboardEligible: z.boolean(),
  }),
});

// ── Leaderboard ─────────────────────────────────────────

export const leaderboardEntrySchema = z.object({
  rank: z.number(),
  playerName: z.string(),
  nationalityCode: z.string(),
  nationalityName: z.string(),
  nationalityFlagEmoji: z.string(),
  score: z.number(),
  correctCount: z.number(),
  totalQuestions: z.number(),
  durationSeconds: z.number(),
  quizMode: z.string(),
  createdAt: z.string(),
});

export const eligibilityResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    eligible: z.boolean(),
    currentMinScore: z.number().nullable(),
    currentMinDurationSeconds: z.number().nullable(),
    totalEntries: z.number(),
  }),
});

export const submitScoreRequestSchema = z.object({
  resultId: z.string(),
  playerName: z.string().min(2).max(20),
  nationalityCode: z.string().length(2),
  deviceId: z.string().optional(),
});

// ── Error Codes ─────────────────────────────────────────

export const errorCodes = {
  COUNTRY_NOT_FOUND: "COUNTRY_NOT_FOUND",
  INDICATOR_NOT_FOUND: "INDICATOR_NOT_FOUND",
  QUIZ_SESSION_NOT_FOUND: "QUIZ_SESSION_NOT_FOUND",
  QUIZ_SESSION_ALREADY_SUBMITTED: "QUIZ_SESSION_ALREADY_SUBMITTED",
  QUIZ_RESULT_NOT_FOUND: "QUIZ_RESULT_NOT_FOUND",
  LEADERBOARD_NOT_ELIGIBLE: "LEADERBOARD_NOT_ELIGIBLE",
  INVALID_PLAYER_NAME: "INVALID_PLAYER_NAME",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes];

// ── Types ───────────────────────────────────────────────

export type Country = z.infer<typeof countrySchema>;
export type Indicator = z.infer<typeof indicatorSchema>;
export type CompareResultItem = z.infer<typeof compareResultItemSchema>;
export type CompareResponse = z.infer<typeof compareResponseSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type QuizResultResponse = z.infer<typeof quizResultResponseSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type TrendingItem = z.infer<typeof trendingItemSchema>;
export type DailyCompare = z.infer<typeof dailyCompareSchema>;
