"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Language } from "./types";
import { LANGUAGES, LANGUAGE_LABELS, LANGUAGE_FLAGS, LANGUAGE_COOKIE_NAME, DEFAULT_LANGUAGE, isLanguage } from "./types";
import { createTranslate, type TranslateFunction, type TranslationKey } from "./translations";

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslateFunction;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLang,
  children,
}: {
  initialLang: Language;
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<Language>(initialLang);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLang};path=/;max-age=${60 * 60 * 24 * 365}`;
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return createTranslate(lang)(key, params);
    },
    [lang],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useT(): TranslateFunction {
  return useI18n().t;
}

export { LANGUAGES, LANGUAGE_LABELS, LANGUAGE_FLAGS, type Language, type TranslationKey };
