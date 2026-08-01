import type { Language } from "./types";
import { DEFAULT_LANGUAGE, isLanguage } from "./types";

const COUNTRY_TO_LANGUAGE: Record<string, Language> = {
  KR: "ko",
  JP: "ja",
  CN: "zh",
  TW: "zh",
  HK: "zh",
  MO: "zh",
};

export function languageFromCountryCode(countryCode: string | null | undefined): Language {
  if (!countryCode) return DEFAULT_LANGUAGE;
  const code = countryCode.toUpperCase();
  return COUNTRY_TO_LANGUAGE[code] ?? DEFAULT_LANGUAGE;
}

export function languageFromAcceptLanguage(header: string | null | undefined): Language {
  if (!header) return DEFAULT_LANGUAGE;
  const lower = header.toLowerCase();
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("zh")) return "zh";
  return DEFAULT_LANGUAGE;
}

export function detectLanguage(opts: {
  cookie?: string | null;
  ipCountry?: string | null;
  acceptLanguage?: string | null;
}): Language {
  if (opts.cookie && isLanguage(opts.cookie)) return opts.cookie;
  if (opts.ipCountry) {
    const lang = languageFromCountryCode(opts.ipCountry);
    if (lang !== DEFAULT_LANGUAGE) return lang;
  }
  if (opts.acceptLanguage) {
    return languageFromAcceptLanguage(opts.acceptLanguage);
  }
  return DEFAULT_LANGUAGE;
}
