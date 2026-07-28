import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World VS — 국가 비교 & 퀴즈",
  description: "세계 국가를 비교하고 퀴즈로 학습하는 웹 서비스",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white antialiased">
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="text-lg font-bold flex items-center gap-2">
              <span>🌍</span> World VS
            </a>
            <div className="flex items-center gap-6 text-sm">
              <a href="/compare" className="hover:text-primary-400 transition-colors">비교</a>
              <a href="/quiz" className="hover:text-primary-400 transition-colors">퀴즈</a>
              <a href="/leaderboard" className="hover:text-primary-400 transition-colors">리더보드</a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-white/10 mt-16 py-8 text-center text-sm text-white/40">
          <p>World VS — 공개 데이터 기반 국가 비교 서비스</p>
          <p className="mt-1">데이터 출처: World Bank, UN, Global Firepower, UNESCO 등</p>
        </footer>
      </body>
    </html>
  );
}
