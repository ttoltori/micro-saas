"use client";

import { useState, useEffect, useCallback } from "react";
import { createApiClient } from "@/lib/api";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  id: string;
  type: string;
  questionText: string;
  options: Array<{ id: string; text: string }>;
}

interface QuizSession {
  sessionId: string;
  questions: QuizQuestion[];
}

export default function QuizPlayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; selectedOptionId: string; durationMs: number }>>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    const client = createApiClient();
    client.quiz
      .getSession(sessionId)
      .then((s) => {
        setSession(s as unknown as QuizSession);
        setSessionStartTime(Date.now());
        setQuestionStartTime(Date.now());
      })
      .catch(() => setError("퀴즈 세션을 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleAnswer = useCallback(
    (optionId: string) => {
      if (!session) return;
      const durationMs = Date.now() - questionStartTime;
      const question = session.questions[currentIndex];
      const newAnswers = [...answers, { questionId: question.id, selectedOptionId: optionId, durationMs }];
      setAnswers(newAnswers);

      if (currentIndex + 1 < session.questions.length) {
        setCurrentIndex(currentIndex + 1);
        setQuestionStartTime(Date.now());
      } else {
        setSubmitting(true);
        const totalDurationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
        const client = createApiClient();
        client.quiz
          .submitResult(session.sessionId, { answers: newAnswers, totalDurationSeconds })
          .then((result) => {
            router.push(`/quiz/result/${result.resultId}`);
          })
          .catch(() => {
            setError("제출 중 오류가 발생했습니다.");
            setSubmitting(false);
          });
      }
    },
    [session, currentIndex, answers, questionStartTime, sessionStartTime, router],
  );

  if (loading) return <div className="text-center py-16 text-white/40">불러오는 중...</div>;
  if (error) return <div className="text-center py-16 text-red-400">{error}</div>;
  if (!session) return <div className="text-center py-16 text-white/40">세션을 찾을 수 없습니다.</div>;

  const question = session.questions[currentIndex];
  const progress = ((currentIndex + 1) / session.questions.length) * 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/40">
          {currentIndex + 1} / {session.questions.length}
        </span>
        <a href="/quiz" className="text-sm text-white/40 hover:text-white">나가기</a>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="card">
        <span className="text-xs text-white/40 mb-2 block">{question.type}</span>
        <h2 className="text-xl font-bold mb-6">{question.questionText}</h2>

        <div className="space-y-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt.id)}
              disabled={submitting}
              className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-primary-500 hover:bg-primary-500/10 transition-all disabled:opacity-50"
            >
              {opt.text}
            </button>
          ))}
        </div>

        {submitting && <p className="text-center text-white/40 mt-4">제출 중...</p>}
      </div>
    </div>
  );
}
