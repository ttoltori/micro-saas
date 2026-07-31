"use client";

import { useState, useEffect } from "react";
import { createApiClient } from "@/lib/api";
import type { Country } from "@worldvs/api-contracts";
import { CountryName } from "@/components/country-name";

export default function ComparePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [leftCode, setLeftCode] = useState("");
  const [rightCode, setRightCode] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = createApiClient();
    client.countries
      .list({ pageSize: 100 })
      .then((res) => setCountries(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = countries.filter(
    (c) =>
      c.nameKo.includes(search) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  const canCompare = leftCode && rightCode && leftCode !== rightCode;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">국가 비교</h1>

      <div className="card">
        <input
          type="text"
          placeholder="국가 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/10 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-primary-500"
        />

        {loading ? (
          <p className="text-white/40 text-center py-8">불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
            {filtered.map((c) => {
              const isLeft = leftCode === c.code;
              const isRight = rightCode === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    if (isLeft) {
                      setLeftCode("");
                    } else if (isRight) {
                      setRightCode("");
                    } else if (!leftCode) {
                      setLeftCode(c.code);
                    } else if (!rightCode) {
                      setRightCode(c.code);
                    } else {
                      setLeftCode(c.code);
                      setRightCode("");
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all text-center ${
                    isLeft
                      ? "border-primary-500 bg-primary-500/20"
                      : isRight
                        ? "border-red-500 bg-red-500/20"
                        : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <CountryName
                    code={c.code}
                    name={c.nameKo}
                    className="justify-center"
                    flagClassName="w-7 h-5 rounded object-cover"
                    nameClassName="text-sm font-medium"
                  />
                  <div className="text-xs text-white/40 mt-1">{c.code}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-sm text-white/40 mb-1">좌측</p>
          {leftCode ? (
            <CountryName
              code={leftCode}
              name={countries.find((c) => c.code === leftCode)?.nameKo ?? ""}
              className="text-lg font-bold"
              flagClassName="w-7 h-5 rounded object-cover"
            />
          ) : (
            <p className="text-lg font-bold">선택하세요</p>
          )}
        </div>
        <span className="text-2xl text-white/40">VS</span>
        <div className="text-center">
          <p className="text-sm text-white/40 mb-1">우측</p>
          {rightCode ? (
            <CountryName
              code={rightCode}
              name={countries.find((c) => c.code === rightCode)?.nameKo ?? ""}
              className="text-lg font-bold"
              flagClassName="w-7 h-5 rounded object-cover"
            />
          ) : (
            <p className="text-lg font-bold">선택하세요</p>
          )}
        </div>
      </div>

      {canCompare && (
        <div className="text-center">
          <a href={`/compare/${leftCode}/${rightCode}`} className="btn-primary inline-block">
            비교 결과 보기 →
          </a>
        </div>
      )}
    </div>
  );
}
