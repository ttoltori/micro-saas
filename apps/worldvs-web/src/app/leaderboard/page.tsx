import { createApiClient } from "@/lib/api";
import { Flag } from "@/components/flag";

export default async function LeaderboardPage() {
  const client = createApiClient();
  let entries: Awaited<ReturnType<typeof client.leaderboard.getTop>>["items"] = [];
  let total = 0;

  try {
    const result = await client.leaderboard.getTop(100);
    entries = result.items;
    total = result.total;
  } catch {}

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🏆 리더보드</h1>
        <span className="text-sm text-white/40">총 {total}명 참여</span>
      </div>

      {entries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-white/50">아직 등록된 점수가 없습니다.</p>
          <p className="text-white/30 text-sm mt-2">퀴즈를 풀고 첫 번째 참여자가 되어보세요!</p>
          <a href="/quiz" className="btn-primary inline-block mt-6">퀴즈 풀기</a>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-sm text-white/40">
                <th className="text-left p-4 w-16">순위</th>
                <th className="text-left p-4">닉네임</th>
                <th className="text-left p-4">국적</th>
                <th className="text-right p-4">점수</th>
                <th className="text-right p-4 hidden sm:table-cell">정답</th>
                <th className="text-right p-4 hidden sm:table-cell">시간</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={`${entry.rank}-${entry.playerName}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    {entry.rank <= 3 ? (
                      <span className="text-lg">
                        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      <span className="text-white/60">{entry.rank}</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold">{entry.playerName}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5">
                      <Flag code={entry.nationalityCode} className="w-5 h-3.5 rounded-[2px] object-cover" />
                      <span className="text-sm text-white/60">{entry.nationalityName}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-primary-400">{entry.score}</td>
                  <td className="p-4 text-right hidden sm:table-cell text-white/60">
                    {entry.correctCount}/{entry.totalQuestions}
                  </td>
                  <td className="p-4 text-right hidden sm:table-cell text-white/60">
                    {entry.durationSeconds}초
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
