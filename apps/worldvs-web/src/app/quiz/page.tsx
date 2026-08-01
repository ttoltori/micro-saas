"use client";

import { useState, useEffect } from "react";
import { createApiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useT } from "@worldvs/i18n";

export default function QuizHomePage() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function startQuiz() {
    setLoading(true);
    setError("");
    try {
      const client = createApiClient();
      const session = await client.quiz.createSession({ mode: "DAILY_10" });
      router.push(`/quiz/play/${session.sessionId}`);
    } catch {
      setError(t("quiz.startError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t("quiz.title")}</h1>

      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🧠</div>
        <h2 className="text-2xl font-bold mb-2">{t("quiz.dailyQuiz")}</h2>
        <p className="text-white/50 mb-6">{t("quiz.dailyQuizDesc")}</p>
        <button onClick={startQuiz} disabled={loading} className="btn-primary">
          {loading ? t("quiz.starting") : t("quiz.start")}
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-bold">{t("quiz.feature1Title")}</h3>
          <p className="text-sm text-white/40">{t("quiz.feature1Desc")}</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">⏱️</div>
          <h3 className="font-bold">{t("quiz.feature2Title")}</h3>
          <p className="text-sm text-white/40">{t("quiz.feature2Desc")}</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="font-bold">{t("quiz.feature3Title")}</h3>
          <p className="text-sm text-white/40">{t("quiz.feature3Desc")}</p>
        </div>
      </div>
    </div>
  );
}
