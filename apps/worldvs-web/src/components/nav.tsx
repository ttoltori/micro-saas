"use client";

import { useT } from "@worldvs/i18n";
import { LanguageSwitcher } from "./language-switcher";

export function Nav() {
  const t = useT();
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-lg font-bold flex items-center gap-2">
          <span>🌍</span> World VS
        </a>
        <div className="flex items-center gap-4 text-sm">
          <a href="/compare" className="hover:text-primary-400 transition-colors">{t("nav.compare")}</a>
          <a href="/quiz" className="hover:text-primary-400 transition-colors">{t("nav.quiz")}</a>
          <a href="/leaderboard" className="hover:text-primary-400 transition-colors">{t("nav.leaderboard")}</a>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-white/10 mt-16 py-8 text-center text-sm text-white/40">
      <p>{t("footer.tagline")}</p>
      <p className="mt-1">{t("footer.dataSource")}</p>
    </footer>
  );
}
