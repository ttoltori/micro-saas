"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useI18n, LANGUAGES, LANGUAGE_LABELS, LANGUAGE_FLAGS } from "@worldvs/i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = useCallback(() => setOpen((v) => !v), []);
  const handleSelect = useCallback(
    (l: (typeof LANGUAGES)[number]) => {
      setLang(l);
      setOpen(false);
    },
    [setLang],
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
        aria-label="Language"
      >
        <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
        <span className="hidden sm:inline text-white/70">{LANGUAGE_LABELS[lang]}</span>
        <svg className="w-3 h-3 text-white/40" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/15 bg-[#15151f] shadow-xl py-1 z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              onClick={() => handleSelect(l)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                l === lang ? "text-primary-400 bg-primary-500/10" : "text-white/70 hover:bg-white/10"
              }`}
            >
              <span className="text-base">{LANGUAGE_FLAGS[l]}</span>
              <span>{LANGUAGE_LABELS[l]}</span>
              {l === lang && (
                <svg className="w-3.5 h-3.5 ml-auto" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
