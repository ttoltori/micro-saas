import { createApiClient } from "@/lib/api";

export default async function HomePage() {
  const client = createApiClient();

  let dailyCompare = null;
  let trending: Awaited<ReturnType<typeof client.compare.trending>> = [];

  try {
    dailyCompare = await client.compare.daily();
  } catch {}
  try {
    trending = await client.compare.trending(5);
  } catch {}

  return (
    <div className="space-y-12">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-primary-400">World</span> VS
        </h1>
        <p className="text-xl text-white/60 mb-8">
          세계 국가를 한눈에 비교하고, 퀴즈로 학습하세요
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/compare" className="btn-primary">국가 비교하기</a>
          <a href="/quiz" className="btn-secondary">퀴즈 풀기</a>
        </div>
      </section>

      {dailyCompare && (
        <section>
          <h2 className="text-2xl font-bold mb-4">📅 오늘의 비교</h2>
          <a
            href={`/compare/${dailyCompare.leftCountryCode}/${dailyCompare.rightCountryCode}`}
            className="card flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{dailyCompare.leftFlagEmoji}</span>
              <span className="text-xl font-semibold">{dailyCompare.leftCountryName}</span>
            </div>
            <span className="text-2xl text-white/40">VS</span>
            <div className="flex items-center gap-4">
              <span className="text-xl font-semibold">{dailyCompare.rightCountryName}</span>
              <span className="text-4xl">{dailyCompare.rightFlagEmoji}</span>
            </div>
          </a>
        </section>
      )}

      {trending && trending.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">🔥 인기 비교</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {trending.map((item, i) => (
              <a
                key={i}
                href={`/compare/${item.leftCountryCode}/${item.rightCountryCode}`}
                className="card hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>{item.leftFlagEmoji} {item.leftCountryName}</span>
                  <span className="text-white/40">VS</span>
                  <span>{item.rightCountryName} {item.rightFlagEmoji}</span>
                </div>
                <p className="text-sm text-white/40 mt-2">조회 {item.viewCount}회</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-3">
        <div className="card text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-bold mb-2">20개 지표 비교</h3>
          <p className="text-sm text-white/50">인구, 경제, 군사, 문화, 환경 등 다양한 분야</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">🧠</div>
          <h3 className="text-lg font-bold mb-2">일일 퀴즈</h3>
          <p className="text-sm text-white/50">10문항으로 세계 지식 테스트</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-lg font-bold mb-2">리더보드</h3>
          <p className="text-sm text-white/50">상위 100명과 순위 경쟁</p>
        </div>
      </section>
    </div>
  );
}
