import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, demoToken } from "@/lib/demoGate";

// Hosting-only password gate. With no DEMO_PASSWORD set the site is wide open, so a first deploy
// just works; set it in Vercel to put the whole demo behind one shared password.
// (Next 16 renamed middleware.ts to proxy.ts.)
export async function proxy(request: NextRequest) {
  const secret = process.env.DEMO_PASSWORD;
  if (!secret) return NextResponse.next();

  const cookie = request.cookies.get(DEMO_COOKIE)?.value;
  if (cookie && cookie === (await demoToken(secret))) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!unlock|_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)"],
};
