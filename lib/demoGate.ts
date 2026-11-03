// Hosting-only: the shared demo password gate (see docs/deploy-to-vercel.md). It protects the whole
// deployment, and has nothing to do with the product — T-Res itself has no accounts or sign-in in v1.
// Runs in the Edge runtime (proxy.ts) and in Node (the unlock page), so it uses Web Crypto only.
export const DEMO_COOKIE = "tres-demo";

/** What the cookie holds: a hash of the password, never the password itself. */
export async function demoToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`t-res-demo:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
