// Builds the interactive progress artifact: the real app bundled for the browser (artifact/entry.tsx,
// hash routing) plus the Tailwind CSS from `next build`, as one self-contained HTML page.
//
//   npm run build:artifact                      → .artifact/index.html
//   node scripts/build-artifact.mjs out.html    → after a `next build`
//   STAMP="…" adds a small progress note in the corner.
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const out = path.resolve(process.argv[2] ?? path.join(root, ".artifact/index.html"));
const stamp = process.env.STAMP ?? "";

// The CSS the production build generated for every class the app uses.
const indexHtml = fs.readFileSync(path.join(root, ".next/server/app/index.html"), "utf8");
const cssHrefs = [...new Set([...indexHtml.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]))];
if (cssHrefs.length === 0) throw new Error("No CSS found. Run `npm run build` first.");
const css = cssHrefs.map((h) => fs.readFileSync(path.join(root, ".next", h.replace("/_next/", "")), "utf8")).join("\n");

const result = await esbuild.build({
  absWorkingDir: root,
  entryPoints: ["artifact/entry.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  jsx: "automatic",
  define: {
    "process.env.NODE_ENV": '"production"',
    // Files from public/ ship next to the page (published as artifact files), and PDFs open on IRS.gov.
    "process.env.NEXT_PUBLIC_ASSET_BASE": '""',
    "process.env.NEXT_PUBLIC_ARTIFACT": '"1"',
  },
  alias: { "next/link": "./artifact/next-link.tsx", "next/navigation": "./artifact/next-navigation.ts" },
  legalComments: "none",
  logLevel: "error",
  write: false,
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = `<title>T-Res Taxpayer App</title>
<meta name="description" content="Interactive progress build of the T-Res taxpayer app prototype.">
<style>
${css}
body { background: var(--canvas); }
.tres-stamp { position: fixed; left: 16px; bottom: 16px; z-index: 50; max-width: min(28rem, calc(100vw - 32px)); display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 12px; border-radius: 12px; background: var(--foreground); color: var(--background); font-size: 12px; line-height: 1.35; box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.35); }
.tres-stamp i { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; flex: none; }
.tres-stamp button { flex: none; border: 0; background: transparent; color: inherit; opacity: .7; cursor: pointer; font-size: 16px; line-height: 1; padding: 2px 6px; border-radius: 6px; }
.tres-stamp button:hover, .tres-stamp button:focus-visible { opacity: 1; background: rgb(255 255 255 / .12); }
</style>
<div id="root"></div>
<script>
  // If the app fails to start, say so instead of showing a blank page.
  window.addEventListener("error", (e) => {
    const root = document.getElementById("root");
    if (root && !root.childElementCount) {
      root.innerHTML = '<p style="max-width:40rem;margin:4rem auto;padding:0 16px;font:14px system-ui">This progress build could not start in this browser. Try refreshing, or run the app with <code>npm run dev</code>.</p>';
      console.error(e.error ?? e.message);
    }
  });
</script>
${
  stamp
    ? `<div class="tres-stamp" role="status"><i></i><span>${escapeHtml(stamp)}</span><button type="button" aria-label="Dismiss">×</button></div>`
    : ""
}
<script>${js}</script>
<script>document.querySelector(".tres-stamp button")?.addEventListener("click", (e) => e.currentTarget.parentElement.remove());</script>
`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`Wrote ${path.relative(process.cwd(), out)} (${Math.round(html.length / 1024)} KB)`);
