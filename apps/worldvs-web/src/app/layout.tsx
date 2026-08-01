import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { detectLanguage, LANGUAGE_COOKIE_NAME, I18nProvider, type Language } from "@worldvs/i18n";
import { Nav, Footer } from "@/components/nav";

export const metadata: Metadata = {
  title: "World VS — Country Comparison & Quiz",
  description: "Compare countries and learn with quizzes",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const cookieLang = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  const ipCountry = headerStore.get("x-vercel-ip-country") ?? headerStore.get("cf-ipcountry");
  const acceptLanguage = headerStore.get("accept-language");

  const lang = detectLanguage({ cookie: cookieLang, ipCountry, acceptLanguage });

  return (
    <html lang={lang}>
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white antialiased">
        <I18nProvider initialLang={lang as Language}>
          <Nav />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
