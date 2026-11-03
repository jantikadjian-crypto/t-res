# Putting T-Res online with Vercel

How to host the prototype at a real URL so you can show it to Chris, design partners and investors.
Everything in the code is ready; the steps below are the parts only you can do.

## What you end up with

One site, three ways in:

| Link | What it opens |
|---|---|
| `your-domain.com/demo` | **Share this one.** A front door that explains the prototype and lets people pick a view |
| `your-domain.com/assessment` | The public lead-generation page |
| `your-domain.com/` | Jordan's taxpayer app |
| `your-domain.com/pro/login` | T-Res Pro, for the tax professional |

Both sides stay connected, exactly like the Claude links: sign Form 2848 as Jordan, open T-Res Pro, and the
professional's approval is unblocked.

## Steps

1. **Sign in to Vercel.** Go to vercel.com and choose *Continue with GitHub*, using the account that owns
   `jantikadjian-crypto/t-res`.
2. **Import the repo.** *Add New → Project*, pick `t-res`, then *Import*. Vercel sees it's a Next.js app and fills
   in the build settings itself. Don't change anything.
3. **Deploy.** It takes a couple of minutes and gives you a `something.vercel.app` address. Open it and check
   `/demo` loads.
4. **Put it behind a password** (do this before sharing the link). In Vercel: *Settings → Environment Variables*,
   add `DEMO_PASSWORD` with any phrase you like, for every environment, then *Deployments → ⋯ → Redeploy*.
   Visitors now get a T-Res-branded password screen first. Leave the variable out and the site is open to anyone
   who has the link.
5. **Use your own domain, optional.** *Settings → Domains*, add something like `tres.plcy.app`, and add the DNS
   record Vercel shows you wherever plcy.app is managed. Vercel handles the certificate.

After that, every `git push` to `main` redeploys the site automatically.

## What it costs

Vercel's free Hobby plan is officially for non-commercial use, so showing T-Res to investors sits outside it;
their paid plan is about $20 a month. Cloudflare Pages and Netlify have friendlier free terms if you'd rather not
pay yet, and the app runs on either.

## Good to know

- **Nothing is saved.** Every visitor gets their own session, and a refresh resets it. That's by design in v1:
  no database, no accounts, no real data.
- **Search engines are blocked** (`app/robots.ts`), so the prototype can never be mistaken for a live tax service.
  Remove that file when T-Res is real.
- **The password screen is hosting only.** It isn't a product feature, and T-Res still has no user accounts.
- **The Claude links still work** and are handy for sending a frozen snapshot of a particular moment.

## Changing the password later

Edit `DEMO_PASSWORD` in Vercel and redeploy. Anyone already inside stays signed in for 30 days unless they clear
cookies; to force everyone out, change the password.
