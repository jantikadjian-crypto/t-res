// Hosting-only password gate for the Netlify deploy. With no DEMO_PASSWORD set the site is wide
// open, so a first deploy just works; set that variable in Netlify to put the whole prototype
// behind one shared password. It has nothing to do with the product — T-Res has no accounts in v1.
//
// Self-contained on purpose: Netlify bundles edge functions with Deno and doesn't support importing
// our own modules, so the cookie name and the hash below must stay in step with lib/demoGate.ts,
// which the unlock screen uses. Both are hosting-only and shouldn't need to change again.
declare const Netlify: { env: { get(name: string): string | undefined } };

const COOKIE = "tres-demo";

// What has to load before anyone is let in: the unlock screen itself (its form posts back to the
// same path), Next's own assets, and the files a browser asks for unprompted.
const OPEN = [/^\/unlock$/, /^\/_next\//, /^\/favicon\.ico$/, /^\/icon\.svg$/, /^\/robots\.txt$/];

/** What the cookie holds: a hash of the password, never the password itself. */
async function demoToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`t-res-demo:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export default async function demoGate(
  request: Request,
  context: { cookies: { get(name: string): string | undefined } }
): Promise<Response | undefined> {
  const secret = Netlify.env.get("DEMO_PASSWORD");
  if (!secret) return;

  const url = new URL(request.url);
  if (OPEN.some((open) => open.test(url.pathname))) return;
  if (context.cookies.get(COOKIE) === (await demoToken(secret))) return;

  return Response.redirect(new URL(`/unlock?next=${encodeURIComponent(url.pathname)}`, url), 302);
}

export const config = { path: "/*" };
