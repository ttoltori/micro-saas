import {
  type ApiClientConfig,
  httpRequest,
} from "@worldvs/api-client-core";
import type {
  Country,
  Indicator,
  CompareResponse,
  TrendingItem,
  DailyCompare,
  QuizQuestion,
  QuizResultResponse,
  LeaderboardEntry,
} from "@worldvs/api-contracts";

export interface CreateSessionRequest {
  mode?: string;
  category?: string | null;
  difficulty?: string | null;
}

export interface SubmitQuizRequest {
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    durationMs?: number;
  }>;
  totalDurationSeconds: number;
}

export interface SubmitScoreRequest {
  resultId: string;
  playerName: string;
  nationalityCode: string;
  deviceId?: string;
}

export function createWorldVsClient(config: ApiClientConfig) {
  return {
    countries: {
      list: (params?: {
        region?: string;
        q?: string;
        page?: number;
        pageSize?: number;
      }) =>
        httpRequest<{ items: Country[]; total: number; page: number; pageSize: number }>(
          config,
          "GET",
          "/v1/countries",
          { query: params },
        ),
      get: (code: string) =>
        httpRequest<Country>(config, "GET", `/v1/countries/${code}`),
      recommendations: (code: string) =>
        httpRequest<Country[]>(config, "GET", `/v1/countries/${code}/recommendations`),
    },

    indicators: {
      list: (params?: { category?: string; mvp?: boolean }) =>
        httpRequest<Indicator[]>(config, "GET", "/v1/indicators", { query: params }),
    },

    compare: {
      getComparison: (leftCode: string, rightCode: string) =>
        httpRequest<CompareResponse["data"]>(
          config,
          "GET",
          `/v1/compare/${leftCode}/${rightCode}`,
        ),
      trending: (limit?: number) =>
        httpRequest<TrendingItem[]>(config, "GET", "/v1/compare/trending", {
          query: { limit },
        }),
      daily: () =>
        httpRequest<DailyCompare>(config, "GET", "/v1/compare/daily"),
    },

    quiz: {
      createSession: (req?: CreateSessionRequest) =>
        httpRequest<{ sessionId: string; questions: QuizQuestion[] }>(
          config,
          "POST",
          "/v1/quiz/sessions",
          { body: req ?? {} },
        ),
      getSession: (sessionId: string) =>
        httpRequest<{ sessionId: string; questions: QuizQuestion[] }>(
          config,
          "GET",
          `/v1/quiz/sessions/${sessionId}`,
        ),
      submitResult: (sessionId: string, req: SubmitQuizRequest) =>
        httpRequest<QuizResultResponse["data"]>(
          config,
          "POST",
          `/v1/quiz/sessions/${sessionId}/submit`,
          { body: req },
        ),
      getResult: (resultId: string) =>
        httpRequest<QuizResultResponse["data"]>(
          config,
          "GET",
          `/v1/quiz/results/${resultId}`,
        ),
      checkAnswer: (sessionId: string, questionId: string, selectedOptionId: string) =>
        httpRequest<{ isCorrect: boolean; correctOptionId: string }>(
          config,
          "POST",
          `/v1/quiz/sessions/${sessionId}/check`,
          { body: { questionId, selectedOptionId } },
        ),
    },

    leaderboard: {
      getTop: (limit?: number) =>
        httpRequest<{ items: LeaderboardEntry[]; total: number }>(
          config,
          "GET",
          "/v1/leaderboard",
          { query: { limit } },
        ),
      checkEligibility: (score: number, durationSeconds: number) =>
        httpRequest<{
          eligible: boolean;
          currentMinScore: number | null;
          currentMinDurationSeconds: number | null;
          totalEntries: number;
        }>(config, "GET", "/v1/leaderboard/eligibility", {
          query: { score, durationSeconds },
        }),
      getRank: (score: number, durationSeconds: number) =>
        httpRequest<{ rank: number; totalEntries: number }>(
          config,
          "GET",
          "/v1/leaderboard/rank",
          { query: { score, durationSeconds } },
        ),
      submitScore: (req: SubmitScoreRequest) =>
        httpRequest<{
          rank: number;
          playerName: string;
          nationalityCode: string;
          score: number;
          durationSeconds: number;
        }>(config, "POST", "/v1/leaderboard/submit", { body: req }),
    },
  };
}

export type WorldVsClient = ReturnType<typeof createWorldVsClient>;
