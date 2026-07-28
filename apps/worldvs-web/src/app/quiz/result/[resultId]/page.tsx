import { createApiClient } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ resultId: string }>;
}) {
  const { resultId } = await params;
  const client = createApiClient();

  let result = null;
  try {
    result = await client.quiz.getResult(resultId);
  } catch {
    notFound();
  }

  if (!result) notFound();

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">{result.titleEmoji}</div>
        <h1 className="text-3xl font-bold mb-2">{result.title}</h1>
        <div className="flex justify-center gap-8 mt-6">
          <div>
            <div className="text-4xl font-bold text-primary-400">{result.score}</div>
            <div className="text-sm text-white/40">점수</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{result.correctCount}/{result.totalQuestions}</div>
            <div className="text-sm text-white/40">정답</div>
          </div>
          <div>
            <div className="text-4xl font-bold">{result.durationSeconds}초</div>
            <div className="text-sm text-white/40">소요 시간</div>
          </div>
        </div>

        {result.leaderboardEligible && (
          <div className="mt-8">
            <p className="text-primary-300 mb-4">🏆 리더보드 등록 가능!</p>
            <a href={`/leaderboard/register?resultId=${result.resultId}`} className="btn-primary inline-block">
              리더보드에 등록하기
            </a>
          </div>
        )}

        <div className="flex gap-4 justify-center mt-8">
          <a href="/quiz" className="btn-secondary">다시 풀기</a>
          <a href="/leaderboard" className="btn-secondary">리더보드 보기</a>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">해설</h2>
        {result.details.map((detail, idx) => (
          <div key={idx} className={`card ${detail.isCorrect ? "border-green-500/30" : "border-red-500/30"}`}>
            <div className="flex items-start gap-3">
              <span className={`text-xl ${detail.isCorrect ? "text-green-400" : "text-red-400"}`}>
                {detail.isCorrect ? "✓" : "✗"}
              </span>
              <div className="flex-1">
                <p className="text-sm text-white/40 mb-1">문제 {idx + 1}</p>
                <p className="text-sm">
                  <span className="text-white/60">선택: </span>
                  <span className={detail.isCorrect ? "text-green-400" : "text-red-400"}>{detail.selectedOptionId}</span>
                  <span className="text-white/60"> | 정답: </span>
                  <span className="text-green-400">{detail.correctOptionId}</span>
                </p>
                <p className="text-sm text-white/50 mt-2">{detail.explanation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
