"use client";

import { useState, useEffect, Suspense } from "react";
import { createApiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Country } from "@worldvs/api-contracts";
import { Flag } from "@/components/flag";
import { useT } from "@worldvs/i18n";

interface QuizResultData {
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

export default function QuizResultPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  return (
    <Suspense fallback={<div className="text-center py-16 text-white/40">불러오는 중...</div>}>
      <ResultContent params={params} />
    </Suspense>
  );
}

function ResultContent({ params }: { params: Promise<{ resultId: string }> }) {
  const t = useT();
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  const [playerName, setPlayerName] = useState("");
  const [nationalityCode, setNationalityCode] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      const client = createApiClient();
      client.quiz
        .getResult(p.resultId)
        .then((r) => {
          setResult(r as unknown as QuizResultData);
          if (r.leaderboardEligible) {
            client.leaderboard
              .getRank(r.score, r.durationSeconds)
              .then((rankRes) => {
                setRank(rankRes.rank);
                setTotalEntries(rankRes.totalEntries);
              })
              .catch(() => {});
          }
        })
        .catch(() => setNotFoundFlag(true))
        .finally(() => setLoading(false));

      client.countries
        .list({ pageSize: 200 })
        .then((res) => setCountries(res.items))
        .catch(() => {});
    });
  }, [params]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;
    if (!playerName || playerName.length < 2 || playerName.length > 20) {
      setError("닉네임은 2~20자여야 합니다.");
      return;
    }
    if (!nationalityCode) {
      setError("국적을 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const client = createApiClient();
      await client.leaderboard.submitScore({
        resultId: result.resultId,
        playerName,
        nationalityCode,
      });
      setRegistered(true);
      setTimeout(() => {
        router.push("/leaderboard");
      }, 2000);
    } catch {
      setError("등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center py-16 text-white/40">{t("common.loading")}</div>;
  if (notFoundFlag) return <div className="text-center py-16 text-white/40">{t("common.loading")}</div>;
  if (!result) return <div className="text-center py-16 text-white/40">{t("common.loading")}</div>;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">{result.titleEmoji}</div>
        <h1 className="text-3xl font-bold mb-2">{result.title}</h1>
        <div className="flex justify-center gap-8 mt-6">
          <div>
            <div className="text-4xl font-bold text-primary-400">{result.score}</div>
            <div className="text-base text-white/60">{t("quiz.score")}</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{result.correctCount}/{result.totalQuestions}</div>
            <div className="text-base text-white/60">{t("quiz.correct")}</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{result.durationSeconds}초</div>
            <div className="text-base text-white/60">{t("quiz.duration")}</div>
          </div>
        </div>

        {result.leaderboardEligible && rank !== null && (
          <div className="mt-6">
            <p className="text-xl text-primary-300">
              🏆 {t("quiz.expectedRank")}: <span className="text-2xl font-bold">{rank}위</span>
              <span className="text-base text-white/50 ml-2">({t("quiz.participants", { count: totalEntries })})</span>
            </p>
          </div>
        )}

        {result.leaderboardEligible && !registered && (
          <div className="mt-8 text-left">
            <p className="text-lg text-primary-300 mb-4 text-center">{t("quiz.registerPrompt")}</p>
            <form onSubmit={handleRegister} className="card space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-base text-white/60 mb-2">{t("quiz.nickname")}</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-base"
                  placeholder={t("quiz.nicknamePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-base text-white/60 mb-2">{t("quiz.nationality")}</label>
                <div className="flex items-center gap-2">
                  {nationalityCode && (
                    <Flag code={nationalityCode} className="w-7 h-5 rounded object-cover shrink-0" />
                  )}
                  <select
                    value={nationalityCode}
                    onChange={(e) => setNationalityCode(e.target.value)}
                    className="w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 text-base"
                  >
                    <option value="">{t("quiz.selectCountry")}</option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code} className="bg-slate-800">
                        {c.nameKo} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-primary w-full text-base">
                {submitting ? t("quiz.registering") : t("quiz.register")}
              </button>
            </form>
          </div>
        )}

        {result.leaderboardEligible && registered && (
          <div className="mt-8">
            <p className="text-lg text-primary-300 mb-2">{t("quiz.registered")}</p>
          </div>
        )}

        {!result.leaderboardEligible && (
          <div className="mt-8">
            <p className="text-base text-white/50">{t("quiz.notEligible")}</p>
          </div>
        )}

        <div className="flex gap-4 justify-center mt-8">
          <a href="/quiz" className="btn-secondary">{t("quiz.retry")}</a>
          <a href="/leaderboard" className="btn-secondary">{t("quiz.viewLeaderboard")}</a>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t("quiz.explanation")}</h2>
        {result.details.map((detail, idx) => (
          <div key={idx} className={`card ${detail.isCorrect ? "border-green-500/30" : "border-red-500/30"}`}>
            <div className="flex items-start gap-3">
              <span className={`text-xl ${detail.isCorrect ? "text-green-400" : "text-red-400"}`}>
                {detail.isCorrect ? "✓" : "✗"}
              </span>
              <div className="flex-1">
                <p className="text-sm text-white/50 mb-1">{t("quiz.question", { number: idx + 1 })}</p>
                <p className="text-sm">
                  <span className="text-white/60">{t("quiz.selected")}: </span>
                  <span className={detail.isCorrect ? "text-green-400" : "text-red-400"}>{detail.selectedOptionId}</span>
                  <span className="text-white/60"> | {t("quiz.answer")}: </span>
                  <span className="text-green-400">{detail.correctOptionId}</span>
                </p>
                <p className="text-sm text-white/60 mt-2">{detail.explanation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
