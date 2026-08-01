import { createApiClient } from "@/lib/api";
import { Flag } from "@/components/flag";
import { cookies, headers } from "next/headers";
import { detectLanguage, LANGUAGE_COOKIE_NAME, createTranslate, type Language } from "@worldvs/i18n";

export default async function LeaderboardPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLang = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  const ipCountry = headerStore.get("x-vercel-ip-country") ?? headerStore.get("cf-ipcountry");
  const acceptLanguage = headerStore.get("accept-language");
  const lang = detectLanguage({ cookie: cookieLang, ipCountry, acceptLanguage });
  const t = createTranslate(lang as Language);

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
        <h1 className="text-3xl font-bold">{t("leaderboard.title")}</h1>
        <span className="text-sm text-white/40">{t("leaderboard.totalParticipants", { count: total })}</span>
      </div>

      {entries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-white/50">{t("leaderboard.empty")}</p>
          <p className="text-white/30 text-sm mt-2">{t("leaderboard.emptyDesc")}</p>
          <a href="/quiz" className="btn-primary inline-block mt-6">{t("leaderboard.takeQuiz")}</a>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-sm text-white/40">
                <th className="text-left p-4 w-16">{t("leaderboard.rank")}</th>
                <th className="text-left p-4">{t("leaderboard.nickname")}</th>
                <th className="text-left p-4">{t("leaderboard.nationality")}</th>
                <th className="text-right p-4">{t("leaderboard.score")}</th>
                <th className="text-right p-4 hidden sm:table-cell">{t("leaderboard.correct")}</th>
                <th className="text-right p-4 hidden sm:table-cell">{t("leaderboard.duration")}</th>
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
