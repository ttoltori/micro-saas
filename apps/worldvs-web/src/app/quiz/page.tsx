"use client";

import { useState, useEffect } from "react";
import { createApiClient } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function QuizHomePage() {
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
      setError("퀴즈를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">퀴즈</h1>

      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🧠</div>
        <h2 className="text-2xl font-bold mb-2">일일 퀴즈</h2>
        <p className="text-white/50 mb-6">10문항으로 세계 지식을 테스트하세요</p>
        <button onClick={startQuiz} disabled={loading} className="btn-primary">
          {loading ? "시작 중..." : "퀴즈 시작하기"}
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-bold">10문항</h3>
          <p className="text-sm text-white/40">OX 및 객관식</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">⏱️</div>
          <h3 className="font-bold">시간 측정</h3>
          <p className="text-sm text-white/40">빠를수록 유리</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="font-bold">리더보드</h3>
          <p className="text-sm text-white/40">상위 100명 등록</p>
        </div>
      </div>
    </div>
  );
}
