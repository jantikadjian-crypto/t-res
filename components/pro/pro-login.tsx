"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/form";
import { LinkButton } from "@/components/link-button";
import { ProWordmark } from "@/components/pro/pro-frame";
import { useProSession } from "@/components/pro/pro-session";
import { practitioner } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const MAX_TRIES = 3;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// T-Res Pro sign-in: email and password, then a two-step code. A realistic mock: any password works and the
// demo code is on screen. Tax professionals must use multi-factor authentication (FTC Safeguards Rule).
export function ProLogin() {
  const router = useRouter();
  const { session, justSignedOut, signIn, signOut } = useProSession();
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [email, setEmail] = useState(practitioner.email);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [tries, setTries] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const locked = tries >= MAX_TRIES;

  const submitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Enter the email address you use for T-Res Pro.");
      return;
    }
    if (!password) {
      setError("Enter your password. In this demo, any password works.");
      return;
    }
    setError(null);
    setCode("");
    setStep("code");
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== practitioner.demoCode) {
      const n = tries + 1;
      const left = MAX_TRIES - n;
      setTries(n);
      setError(left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : null);
      return;
    }
    setError(null);
    signIn(email.trim());
    router.push("/pro");
  };

  const startOver = () => {
    setTries(0);
    setCode("");
    setPassword("");
    setError(null);
    setStep("credentials");
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <ProWordmark className="justify-center" />
          <p className="mt-2 text-sm text-muted-foreground">For Enrolled Agents, CPAs and tax attorneys</p>
        </div>

        {session ? (
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
              <div>
                <h1 className="font-medium">You&apos;re signed in as {practitioner.name}</h1>
                <p className="text-sm text-muted-foreground">{session.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <LinkButton href="/pro">
                Go to Today
                <ArrowRight aria-hidden />
              </LinkButton>
              <Button variant="outline" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            {justSignedOut && step === "credentials" && !error && (
              <p role="status" className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-hidden />
                You&apos;ve signed out.
              </p>
            )}

            {step === "credentials" ? (
              <form onSubmit={submitCredentials} className="space-y-4" noValidate>
                <h1 className="text-lg font-medium">Sign in</h1>
                <Field id="pro-email" label="Email">
                  <input
                    id="pro-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field id="pro-password" label="Password">
                  <input
                    id="pro-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                {error && (
                  <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="size-4 shrink-0" aria-hidden />
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full">
                  Sign in
                </Button>
                <button type="button" onClick={() => setShowReset((s) => !s)} className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
                {showReset && (
                  <p className="rounded-lg bg-accent/60 p-3 text-sm text-muted-foreground">
                    In this demo, any password works. Password reset comes with real accounts.
                  </p>
                )}
              </form>
            ) : locked ? (
              <div role="alert" className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="flex items-center gap-2 font-medium text-red-900">
                  <Lock className="size-4 shrink-0 text-red-600" aria-hidden />
                  Too many tries
                </p>
                <p>
                  For your clients&apos; security, sign-in is locked. In the real product you&apos;d wait 15 minutes or
                  call T-Res support to unlock it.
                </p>
                <Button variant="outline" className="bg-white" onClick={startOver}>
                  Start over (demo)
                </Button>
              </div>
            ) : (
              <form onSubmit={submitCode} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <h1 className="flex items-center gap-2 text-lg font-medium">
                    <Smartphone className="size-4 text-primary" aria-hidden />
                    Check your phone
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    We texted a 6-digit code to {practitioner.phoneMasked}.
                    <span className="ml-2 rounded-md border border-yellow-200 bg-yellow-50 px-1.5 py-0.5 font-mono text-xs text-yellow-800">
                      Demo code: {practitioner.demoCode}
                    </span>
                  </p>
                </div>
                <Field id="pro-code" label="Code">
                  <input
                    id="pro-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className={cn(inputClass, "font-mono tracking-[0.4em]")}
                  />
                </Field>
                {error && (
                  <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="size-4 shrink-0" aria-hidden />
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={code.length !== 6}>
                  Verify and sign in
                </Button>
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setCode("");
                      setError(null);
                    }}
                    className="text-primary hover:underline"
                  >
                    Send a new code
                  </button>
                  <button type="button" onClick={startOver} className="text-muted-foreground hover:text-foreground hover:underline">
                    Use a different account
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="space-y-2 text-center text-xs text-muted-foreground">
          <p>Demo: a sample practitioner account. Any password works, and the code is shown on screen.</p>
          <p>
            Paying your own taxes?{" "}
            <Link href="/" className="text-primary hover:underline">
              Go to your T-Res account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
