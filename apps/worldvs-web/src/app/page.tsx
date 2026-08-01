import { createApiClient } from "@/lib/api";
import { CountryName } from "@/components/country-name";
import { cookies, headers } from "next/headers";
import { detectLanguage, LANGUAGE_COOKIE_NAME, createTranslate, type Language } from "@worldvs/i18n";

export default async function HomePage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLang = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  const ipCountry = headerStore.get("x-vercel-ip-country") ?? headerStore.get("cf-ipcountry");
  const acceptLanguage = headerStore.get("accept-language");
  const lang = detectLanguage({ cookie: cookieLang, ipCountry, acceptLanguage });
  const t = createTranslate(lang as Language);

  const client = createApiClient();

  let dailyCompare = null;
  let trending: Awaited<ReturnType<typeof client.compare.trending>> = [];

  try {
    dailyCompare = await client.compare.daily();
  } catch {}
  try {
    trending = await client.compare.trending(5);
  } catch {}

  return (
    <div className="space-y-12">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-primary-400">World</span> VS
        </h1>
        <p className="text-xl text-white/60 mb-8">
          {t("home.subtitle")}
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/compare" className="btn-primary">{t("home.compareButton")}</a>
          <a href="/quiz" className="btn-secondary">{t("home.quizButton")}</a>
        </div>
      </section>

      {dailyCompare && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("home.dailyCompare")}</h2>
          <a
            href={`/compare/${dailyCompare.leftCountryCode}/${dailyCompare.rightCountryCode}`}
            className="card flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <CountryName
              code={dailyCompare.leftCountryCode}
              name={dailyCompare.leftCountryName}
              className="text-xl font-semibold"
              flagClassName="w-8 h-6 rounded object-cover"
            />
            <span className="text-2xl text-white/40">VS</span>
            <CountryName
              code={dailyCompare.rightCountryCode}
              name={dailyCompare.rightCountryName}
              className="text-xl font-semibold"
              flagClassName="w-8 h-6 rounded object-cover"
            />
          </a>
        </section>
      )}

      {trending && trending.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{t("home.trending")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {trending.map((item, i) => (
              <a
                key={i}
                href={`/compare/${item.leftCountryCode}/${item.rightCountryCode}`}
                className="card hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <CountryName code={item.leftCountryCode} name={item.leftCountryName} />
                  <span className="text-white/40">VS</span>
                  <CountryName code={item.rightCountryCode} name={item.rightCountryName} />
                </div>
                <p className="text-sm text-white/40 mt-2">{t("home.views", { count: item.viewCount })}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-3">
        <div className="card text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-bold mb-2">{t("home.feature1Title")}</h3>
          <p className="text-sm text-white/50">{t("home.feature1Desc")}</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">🧠</div>
          <h3 className="text-lg font-bold mb-2">{t("home.feature2Title")}</h3>
          <p className="text-sm text-white/50">{t("home.feature2Desc")}</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-lg font-bold mb-2">{t("home.feature3Title")}</h3>
          <p className="text-sm text-white/50">{t("home.feature3Desc")}</p>
        </div>
      </section>
    </div>
  );
}
