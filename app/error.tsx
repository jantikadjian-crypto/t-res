"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/link-button";

// Something broke while showing a page. Say so plainly and offer a way forward.
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
        <div className="text-2xl leading-none font-extrabold tracking-tight text-primary">T-Res</div>
        <div className="space-y-2">
          <h1 className="text-lg font-medium">This page didn&apos;t load</h1>
          <p className="text-sm text-muted-foreground">
            Nothing in your case has changed. Try again, or head back to your dashboard.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => retry()}>
            <RotateCcw aria-hidden />
            Try again
          </Button>
          <LinkButton href="/" variant="outline">
            <Home aria-hidden />
            Go to your dashboard
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
