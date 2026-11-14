import { NextResponse, type NextRequest } from "next/server";
import { PIN_COOKIE, pinHash } from "@/lib/pin";

let hinweisGezeigt = false;

export async function middleware(req: NextRequest) {
  const pin = process.env.APP_PIN;
  if (!pin) {
    if (!hinweisGezeigt) {
      console.warn("[PIN] APP_PIN ist nicht gesetzt – Zugang ist offen (nur lokal so lassen!).");
      hinweisGezeigt = true;
    }
    return NextResponse.next();
  }
  const { pathname } = req.nextUrl;
  if (pathname === "/pin") return NextResponse.next();

  const cookie = req.cookies.get(PIN_COOKIE)?.value;
  if (cookie && cookie === (await pinHash(pin))) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/pin";
  url.search = "";
  if (pathname !== "/") url.searchParams.set("weiter", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api/health|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest|robots.txt|icons/).*)",
  ],
};
