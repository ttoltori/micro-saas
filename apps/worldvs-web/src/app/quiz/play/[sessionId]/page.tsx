"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createApiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useT } from "@worldvs/i18n";

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

function playSound(correct: boolean) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (correct) {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(311.13, ctx.currentTime);
      osc.frequency.setValueAtTime(233.08, ctx.currentTime + 0.15);
    }

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // AudioContext not available
  }
}

export default function QuizPlayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const t = useT();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; selectedOptionId: string; durationMs: number }>>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<null | { correct: boolean }>(null);
  const [locked, setLocked] = useState(false);
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const goToNext = useCallback(
    (newAnswers: Array<{ questionId: string; selectedOptionId: string; durationMs: number }>) => {
      if (!session) return;
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
    [session, currentIndex, sessionStartTime, router],
  );

  const handleAnswer = useCallback(
    (optionId: string) => {
      if (!session || locked) return;
      setLocked(true);
      const durationMs = Date.now() - questionStartTime;
      const question = session.questions[currentIndex];
      const newAnswers = [...answers, { questionId: question.id, selectedOptionId: optionId, durationMs }];
      setAnswers(newAnswers);

      const client = createApiClient();
      client.quiz
        .checkAnswer(session.sessionId, question.id, optionId)
        .then((result) => {
          setFeedback({ correct: result.isCorrect });
          playSound(result.isCorrect);
          if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
          feedbackTimer.current = setTimeout(() => {
            setFeedback(null);
            setLocked(false);
            goToNext(newAnswers);
          }, 1200);
        })
        .catch(() => {
          setLocked(false);
          goToNext(newAnswers);
        });
    },
    [session, currentIndex, answers, questionStartTime, locked, goToNext],
  );

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  if (loading) return <div className="text-center py-16 text-white/40">{t("common.loading")}</div>;
  if (error) return <div className="text-center py-16 text-red-400">{error}</div>;
  if (!session) return <div className="text-center py-16 text-white/40">{t("common.loading")}</div>;

  const question = session.questions[currentIndex];
  const progress = ((currentIndex + 1) / session.questions.length) * 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/40">
          {t("quiz.progress", { current: currentIndex + 1, total: session.questions.length })}
        </span>
        <a href="/quiz" className="text-sm text-white/40 hover:text-white">{t("quiz.exit")}</a>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="card relative overflow-hidden">
        {feedback && (
          <div
            className={`absolute inset-0 z-20 flex items-center justify-center text-8xl font-black ${
              feedback.correct ? "text-primary-400" : "text-red-400"
            }`}
            style={{ animation: "pop 0.3s ease-out" }}
          >
            {feedback.correct ? "O" : "X"}
          </div>
        )}

        <span className="text-sm text-white/50 mb-2 block">{question.type}</span>
        <h2 className="text-xl font-bold mb-6">{question.questionText}</h2>

        <div className="space-y-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt.id)}
              disabled={submitting || locked}
              className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-primary-500 hover:bg-primary-500/10 transition-all disabled:opacity-50 text-base"
            >
              {opt.text}
            </button>
          ))}
        </div>

        {submitting && <p className="text-center text-white/40 mt-4">{t("quiz.submitting")}</p>}
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
