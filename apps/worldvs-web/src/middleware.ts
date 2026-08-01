import { NextResponse, type NextRequest } from "next/server";
import { detectLanguage, LANGUAGE_COOKIE_NAME, type Language } from "@worldvs/i18n";

export function middleware(request: NextRequest) {
  const cookieLang = request.cookies.get(LANGUAGE_COOKIE_NAME)?.value;
  const ipCountry = request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry");
  const acceptLanguage = request.headers.get("accept-language");

  const lang = detectLanguage({ cookie: cookieLang, ipCountry, acceptLanguage });

  const response = NextResponse.next();
  if (cookieLang !== lang) {
    response.cookies.set(LANGUAGE_COOKIE_NAME, lang as Language, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
