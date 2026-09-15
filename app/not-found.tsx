import type { Metadata } from "next";
import { Home, Search } from "lucide-react";
import { LinkButton } from "@/components/link-button";

export const metadata: Metadata = { title: "Page not found · T-Res" };

// Shown for any link that goes nowhere. Calm, and always a way back.
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="text-2xl leading-none font-extrabold tracking-tight text-primary">T-Res</div>
        <div className="space-y-2">
          <h1 className="text-lg font-medium">We couldn&apos;t find that page</h1>
          <p className="text-sm text-muted-foreground">
            The link may be out of date. Your case is safe, and everything in it is still where you left it.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <LinkButton href="/">
            <Home aria-hidden />
            Go to your dashboard
          </LinkButton>
          <LinkButton href="/library" variant="outline">
            <Search aria-hidden />
            Browse the Library
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
