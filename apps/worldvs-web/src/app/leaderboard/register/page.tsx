"use client";

import { useState, useEffect, Suspense } from "react";
import { createApiClient } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import type { Country } from "@worldvs/api-contracts";

export default function LeaderboardRegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-white/40">불러오는 중...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const [playerName, setPlayerName] = useState("");
  const [nationalityCode, setNationalityCode] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get("resultId");

  useEffect(() => {
    const client = createApiClient();
    client.countries
      .list({ pageSize: 100 })
      .then((res) => setCountries(res.items))
      .catch(() => {});
  }, []);

  if (!resultId) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400">결과 ID가 없습니다. 퀴즈를 먼저 풀어주세요.</p>
        <a href="/quiz" className="btn-primary inline-block mt-4">퀴즈 풀기</a>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!playerName || playerName.length < 2 || playerName.length > 20) {
      setError("닉네임은 2~20자여야 합니다.");
      return;
    }
    if (!nationalityCode) {
      setError("국적을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const client = createApiClient();
      await client.leaderboard.submitScore({
        resultId: resultId!,
        playerName,
        nationalityCode,
      });
      router.push("/leaderboard");
    } catch {
      setError("등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center">🏆 리더보드 등록</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-2">닉네임 (2~20자)</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            className="w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="닉네임 입력"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-2">국적</label>
          <select
            value={nationalityCode}
            onChange={(e) => setNationalityCode(e.target.value)}
            className="w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">국가 선택</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code} className="bg-slate-800">
                {c.flagEmoji} {c.nameKo} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
