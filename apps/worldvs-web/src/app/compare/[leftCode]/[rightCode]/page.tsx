import { createApiClient } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function CompareResultPage({
  params,
}: {
  params: Promise<{ leftCode: string; rightCode: string }>;
}) {
  const { leftCode, rightCode } = await params;
  const client = createApiClient();

  let comparison = null;
  try {
    comparison = await client.compare.getComparison(leftCode, rightCode);
  } catch {
    notFound();
  }

  if (!comparison) notFound();

  const { leftCountry, rightCountry, results, scoreSummary, badges } = comparison;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <a href="/compare" className="text-sm text-white/40 hover:text-white">← 국가 선택으로</a>
      </div>

      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-6xl mb-2">{leftCountry.flagEmoji}</div>
            <h1 className="text-2xl font-bold">{leftCountry.nameKo}</h1>
            <div className="flex gap-2 mt-2 justify-center flex-wrap">
              {badges.left.map((b, i) => (
                <span key={i} className="text-xs bg-white/10 rounded-full px-2 py-1">
                  {b.emoji} {b.label}
                </span>
              ))}
            </div>
          </div>
          <span className="text-3xl text-white/30">VS</span>
          <div className="text-center">
            <div className="text-6xl mb-2">{rightCountry.flagEmoji}</div>
            <h1 className="text-2xl font-bold">{rightCountry.nameKo}</h1>
            <div className="flex gap-2 mt-2 justify-center flex-wrap">
              {badges.right.map((b, i) => (
                <span key={i} className="text-xs bg-white/10 rounded-full px-2 py-1">
                  {b.emoji} {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card text-center">
        <p className="text-lg">{scoreSummary.summaryText}</p>
        <div className="flex justify-center gap-8 mt-4">
          <div>
            <span className="text-2xl font-bold text-primary-400">{scoreSummary.leftWins}</span>
            <span className="text-sm text-white/40 ml-1">승</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-white/40">{scoreSummary.draws}</span>
            <span className="text-sm text-white/40 ml-1">무</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-red-400">{scoreSummary.rightWins}</span>
            <span className="text-sm text-white/40 ml-1">승</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((item, idx) => (
          <div key={idx} className="card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs text-white/40 mr-2">{item.indicator.category}</span>
                <span className="font-semibold">{item.indicator.nameKo}</span>
                <span className="text-xs text-white/40 ml-2">({item.indicator.unit})</span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  item.winner === "LEFT"
                    ? "bg-primary-500/20 text-primary-300"
                    : item.winner === "RIGHT"
                      ? "bg-red-500/20 text-red-300"
                      : "bg-white/10 text-white/40"
                }`}
              >
                {item.winner === "LEFT" ? `${leftCountry.nameKo} 승` : item.winner === "RIGHT" ? `${rightCountry.nameKo} 승` : item.winner === "DRAW" ? "무승부" : "데이터 없음"}
              </span>
            </div>

            {item.indicator.displayType !== "TEXT" && (
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 text-right">
                  <span className="text-lg font-bold">
                    {item.leftValue?.value != null ? formatValue(item.leftValue.value, item.indicator.displayType, item.indicator.decimalPlaces) : "—"}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-lg font-bold">
                    {item.rightValue?.value != null ? formatValue(item.rightValue.value, item.indicator.displayType, item.indicator.decimalPlaces) : "—"}
                  </span>
                </div>
              </div>
            )}

            {item.indicator.displayType !== "TEXT" && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="gauge-bar">
                    <div className="gauge-fill bg-primary-500" style={{ width: `${item.leftGauge}%` }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="gauge-bar">
                    <div className="gauge-fill bg-red-500" style={{ width: `${item.rightGauge}%` }} />
                  </div>
                </div>
              </div>
            )}

            {item.indicator.displayType === "TEXT" && (
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 text-right">
                  <span className="text-lg font-bold">{item.leftValue?.textValue ?? "—"}</span>
                </div>
                <div className="flex-1">
                  <span className="text-lg font-bold">{item.rightValue?.textValue ?? "—"}</span>
                </div>
              </div>
            )}

            <p className="text-sm text-white/50 mt-2">{item.summaryText}</p>
            <p className="text-xs text-white/30 mt-1">출처: {item.leftValue?.sourceName ?? item.rightValue?.sourceName ?? item.indicator.sourceName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatValue(value: number, displayType: string, decimalPlaces: number): string {
  if (displayType === "MONEY") {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}조`;
    if (value >= 1e8) return `${(value / 1e8).toFixed(1)}억`;
    if (value >= 1e4) return `${(value / 1e4).toFixed(1)}만`;
    return value.toLocaleString();
  }
  if (displayType === "PERCENT") return `${value.toFixed(decimalPlaces)}%`;
  if (displayType === "COUNT" || displayType === "NUMBER") {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  }
  return value.toFixed(decimalPlaces);
}
