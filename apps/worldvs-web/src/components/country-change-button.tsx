"use client";

import { useState, useEffect, useRef } from "react";
import { createApiClient } from "@/lib/api";
import type { Country } from "@worldvs/api-contracts";
import { CountryName } from "./country-name";
import { useRouter } from "next/navigation";
import { useT } from "@worldvs/i18n";

interface CountryChangeButtonProps {
  side: "left" | "right";
  currentCode: string;
  otherCode: string;
}

export function CountryChangeButton({
  side,
  currentCode,
  otherCode,
}: CountryChangeButtonProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && countries.length === 0) {
      setLoading(true);
      const client = createApiClient();
      client.countries
        .list({ pageSize: 200 })
        .then((res) => setCountries(res.items))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, countries.length]);

  const filtered = countries.filter(
    (c) =>
      c.nameKo.includes(search) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
  );

  function selectCountry(code: string) {
    const left = side === "left" ? code : currentCode;
    const right = side === "right" ? code : currentCode;
    if (left === right) {
      const other = side === "left" ? otherCode : currentCode;
      if (side === "left") {
        router.push(`/compare/${code}/${other}`);
      } else {
        router.push(`/compare/${other}/${code}`);
      }
    } else {
      router.push(`/compare/${left}/${right}`);
    }
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-white/60 hover:text-white underline underline-offset-2 transition-colors"
      >
        {t("compare.changeCountry")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            ref={modalRef}
            className="bg-[#15151f] rounded-2xl border border-white/15 p-6 w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">{t("compare.countrySelect")}</h3>

            <input
              type="text"
              placeholder={t("compare.searchCountry")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-primary-500 text-base"
            />

            {loading ? (
              <p className="text-white/50 text-center py-8">{t("compare.loading")}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1">
                {filtered.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => selectCountry(c.code)}
                    className={`p-3 rounded-xl border transition-all text-center ${
                      c.code === currentCode
                        ? "border-primary-500 bg-primary-500/20"
                        : c.code === otherCode
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
                ))}
              </div>
            )}

            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-sm text-white/50 hover:text-white transition-colors"
            >
              {t("compare.close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
