export type Language = "ko" | "ja" | "zh" | "en";

export const LANGUAGES: Language[] = ["ko", "ja", "zh", "en"];

export const LANGUAGE_LABELS: Record<Language, string> = {
  ko: "한국어",
  ja: "日本語",
  zh: "中文",
  en: "English",
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  ko: "🇰🇷",
  ja: "🇯🇵",
  zh: "🇨🇳",
  en: "🇺🇸",
};

export const DEFAULT_LANGUAGE: Language = "en";

export const LANGUAGE_COOKIE_NAME = "lang";

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as string[]).includes(value);
}
