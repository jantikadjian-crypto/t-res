# Putting T-Res online with Netlify

How to host the prototype at a real URL so you can show it to Chris, design partners and investors.
Everything in the code is ready; the steps below are the parts only you can do.

## What you end up with

One site, four ways in:

| Link | What it opens |
|---|---|
| `your-site.netlify.app/demo` | **Share this one.** A front door that explains the prototype and lets people pick a view |
| `your-site.netlify.app/assessment` | The public lead-generation page |
| `your-site.netlify.app/` | Jordan's taxpayer app |
| `your-site.netlify.app/pro/login` | T-Res Pro, for the tax professional |

Both sides stay connected, exactly like the Claude links: sign Form 2848 as Jordan, open T-Res Pro, and the
professional's approval is unblocked.

## Steps

1. **Sign in to Netlify** at app.netlify.com with the GitHub account that owns `jantikadjian-crypto/t-res`.
2. **Import the repo.** *Add new site → Import an existing project → GitHub*, pick `t-res`, and authorise Netlify
   to read it. It reads `netlify.toml` and fills in the build settings itself — don't change them.
3. **Deploy.** The first build takes a few minutes. Netlify gives you a `something.netlify.app` address; open
   `/demo` and check it loads. Rename the site under *Site configuration → Site details* if you want a tidier
   address.
4. **Put it behind a password** (do this before sharing the link). *Site configuration → Environment variables →
   Add a variable*: key `DEMO_PASSWORD`, any phrase you like, same value for all contexts. Make sure the
   **Functions** scope is ticked, since that's what the gate reads. Then *Deploys → Trigger deploy → Deploy site*.
   Visitors now get a T-Res-branded password screen first. Leave the variable out and the site is open to anyone
   who has the link.
5. **Use your own domain, optional.** *Domain management → Add a domain*, e.g. `tres.plcy.app`, then add the DNS
   record Netlify shows you wherever plcy.app is managed. Netlify handles the certificate.

After that, every `git push` to `main` redeploys the site automatically, and every pull request gets its own
preview URL.

## If the build fails

The one thing to watch for: Netlify's Next.js runtime currently can't package Next 16's `proxy.ts` (the file that
replaced `middleware.ts`) — it dies on a missing Turbopack chunk, a known open bug. So T-Res doesn't have one.
The password gate is a Netlify edge function instead (`netlify/edge-functions/demo-gate.ts`), which Netlify runs
before the app and which no Next.js release can break. **Don't add a `proxy.ts` or `middleware.ts` to this repo
while it's hosted on Netlify.** If a build ever fails mentioning `netlify-edge-handler-node-middleware`, that's
what happened.

Otherwise: Netlify keeps its Next.js runtime up to date on every build, and the version is deliberately not
pinned, so compatibility fixes arrive on their own.

## What it costs

Netlify's free Starter plan covers this: 100 GB of bandwidth and 300 build minutes a month, which a prototype
shown to a handful of people won't come close to. Password protection on Netlify's own *site* settings is a paid
feature, which is why the gate above is built into the app instead — it works on the free plan.

## Good to know

- **Nothing is saved.** Every visitor gets their own session, and a refresh resets it. That's by design in v1:
  no database, no accounts, no real data.
- **Search engines are blocked** (`app/robots.ts`), so the prototype can never be mistaken for a live tax service.
  Remove that file when T-Res is real.
- **The password screen is hosting only.** It isn't a product feature, and T-Res still has no user accounts.
- **The Claude links still work** and are handy for sending a frozen snapshot of a particular moment.

## Changing the password later

Edit `DEMO_PASSWORD` in Netlify and redeploy. Anyone already inside stays in for 30 days unless they clear
cookies; changing the password forces everyone out, because the cookie holds a hash of the old one.

## Other hosts

The app is a plain Next.js app and runs anywhere that supports it. Two differences worth knowing:

- **Vercel** needs the gate as a Next `proxy.ts` instead of the Netlify edge function — see commit `f1cdff4` in
  git history for the version that was there. Vercel's free Hobby plan is also non-commercial only, so showing
  T-Res to investors sits outside it.
- **Cloudflare Workers** has the same `proxy.ts` gap as Netlify, so it would need its own equivalent.
