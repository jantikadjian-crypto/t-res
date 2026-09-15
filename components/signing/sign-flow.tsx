"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  PenLine,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { useCase, type SignatureRecord } from "@/components/case-provider";
import { Field, inputClass } from "@/components/form";
import { LinkButton } from "@/components/link-button";
import { SignaturePad } from "@/components/signing/signature-pad";
import { SignatureCertificate, signatureFont } from "@/components/signing/signature-certificate";
import { formatDate } from "@/lib/format";
import {
  enrolledAgent,
  MOCK_TODAY,
  representativeDetails,
  signingTerms,
  taxpayerIdentity,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

const STEPS = ["Review", "Consent", "Verify", "Sign", "Done"];
const MAX_ATTEMPTS = 3;
// Documentation-range address: the prototype has no server to see the real one.
const DEMO_IP = "203.0.113.24 (demo)";

function timestamp() {
  return `${formatDate(MOCK_TODAY)}, ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function describeDevice(): string {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : "an unknown system";
  return `${browser} on ${os}`;
}

async function sha256(payload: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0;
  for (const ch of payload) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (h >>> 0).toString(16).padStart(8, "0");
}

// A typed signature must have the legal first and last name.
function matchesLegalName(typed: string) {
  const words = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  const t = words(typed);
  const legal = words(taxpayerIdentity.legalName);
  return t.length >= 2 && t[0] === legal[0] && t[t.length - 1] === legal[legal.length - 1];
}

function Frame({ docId, step, children }: { docId: string; step: number; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="text-xl leading-none font-extrabold tracking-tight text-primary">
              T-Res
            </Link>
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
            <Breadcrumbs className="hidden sm:block" />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <Lock className="size-3" aria-hidden />
              Secure signing
            </span>
            <LinkButton href={`/documents/${docId}`} variant="outline" size="sm">
              {step === STEPS.length - 1 ? "Close" : "Cancel"}
            </LinkButton>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <ol className="mb-8 grid grid-cols-5 gap-2" aria-label="Signing steps">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? "step" : undefined} className="space-y-2">
              <div className={cn("h-1 rounded-full", i < step ? "bg-green-500" : i === step ? "bg-primary" : "bg-secondary")} />
              <p className={cn("text-xs font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>
                <span className="hidden sm:inline">{i + 1}. </span>
                {s}
              </p>
            </li>
          ))}
        </ol>
        {children}
      </div>
    </div>
  );
}

function StepCard({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-xl border bg-card p-6 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-balance">{title}</h1>
        {intro && <p className="mt-1 text-sm text-muted-foreground">{intro}</p>}
      </div>
      {children}
    </div>
  );
}

function Nav({ onBack, next }: { onBack?: () => void; next: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t pt-5">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft aria-hidden />
          Back
        </Button>
      ) : (
        <span />
      )}
      {next}
    </div>
  );
}

// One filled-in field on the form preview.
function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 border-b border-dotted py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// The form itself, filled in with the real case details.
function Form2848Pages({ taxMatters }: { taxMatters: { matter: string; form: string; years: string }[] }) {
  return (
    <div className="space-y-4 rounded-xl border bg-muted/40 p-4" aria-label="Form 2848, 2 pages">
      <div className="space-y-4 rounded-sm bg-white p-5 text-xs shadow-sm ring-1 ring-black/5">
        <div className="flex items-start justify-between gap-3 border-b pb-2">
          <div>
            <p className="font-mono text-sm font-bold">Form 2848</p>
            <p className="text-[10px] text-muted-foreground uppercase">Department of the Treasury · Internal Revenue Service</p>
          </div>
          <p className="text-right text-[11px] font-semibold">Power of Attorney and Declaration of Representative</p>
        </div>
        <section className="space-y-1">
          <p className="font-semibold">Part I · 1 Taxpayer information</p>
          <Line label="Name" value={taxpayerIdentity.legalName} />
          <Line label="Address" value={taxpayerIdentity.address} />
          <Line label="SSN" value={taxpayerIdentity.ssnMasked} />
        </section>
        <section className="space-y-1">
          <p className="font-semibold">2 Representative</p>
          <Line label="Name" value={`${enrolledAgent.name}, ${enrolledAgent.credential}`} />
          <Line label="CAF No." value={representativeDetails.cafNumber} />
          <Line label="Telephone" value={representativeDetails.phone} />
        </section>
        <section className="space-y-1">
          <p className="font-semibold">3 Acts authorized</p>
          <table className="w-full border text-left text-xs">
            <thead className="bg-muted/60">
              <tr>
                <th className="border px-2 py-1 font-medium">Description of matter</th>
                <th className="border px-2 py-1 font-medium">Tax form</th>
                <th className="border px-2 py-1 font-medium">Year(s)</th>
              </tr>
            </thead>
            <tbody>
              {taxMatters.map((m) => (
                <tr key={m.matter}>
                  <td className="border px-2 py-1">{m.matter}</td>
                  <td className="border px-2 py-1">{m.form}</td>
                  <td className="border px-2 py-1">{m.years}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <p className="text-right text-[10px] text-muted-foreground">Page 1 of 2</p>
      </div>
      <div className="space-y-4 rounded-sm bg-white p-5 text-xs shadow-sm ring-1 ring-black/5">
        <section className="space-y-2">
          <p className="font-semibold">7 Taxpayer declaration and signature</p>
          <p className="text-muted-foreground">
            I authorize the representative named above to represent me before the IRS for the tax matters listed.
          </p>
          <div className="grid grid-cols-[1fr_7rem] gap-3 pt-2">
            <div className="border-b border-foreground/40 pb-1 text-muted-foreground italic">You&apos;ll sign in step 4</div>
            <div className="border-b border-foreground/40 pb-1">{formatDate(MOCK_TODAY)}</div>
          </div>
          <p className="text-[10px] text-muted-foreground">Signature · Date · Print name: {taxpayerIdentity.legalName}</p>
        </section>
        <section className="space-y-1">
          <p className="font-semibold">Part II · Declaration of representative</p>
          <Line label="Designation" value={representativeDetails.designation} />
          <Line label="Licensing" value={representativeDetails.enrollment} />
          <Line label="Signed" value={`${enrolledAgent.name} · ${formatDate(representativeDetails.signedOn)}`} />
        </section>
        <p className="text-right text-[10px] text-muted-foreground">Page 2 of 2</p>
      </div>
    </div>
  );
}

export function SignFlow({ docId }: { docId: string }) {
  const { docs, signatures, recordSignature } = useCase();
  const doc = docs.find((d) => d.id === docId);
  const terms = signingTerms[docId];
  const existing = signatures[docId];

  const [step, setStep] = useState(0);
  const [reviewed, setReviewed] = useState(false);
  const [consented, setConsented] = useState(false);
  const [ssn, setSsn] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [method, setMethod] = useState<"typed" | "drawn">("typed");
  const [typed, setTyped] = useState("");
  const [drawing, setDrawing] = useState<string | null>(null);
  const [audit, setAudit] = useState<{ label: string; at: string }[]>([]);
  const [signing, setSigning] = useState(false);

  const log = (label: string) => setAudit((a) => [...a, { label, at: timestamp() }]);
  const locked = attempts >= MAX_ATTEMPTS;

  if (existing) {
    return (
      <Frame docId={docId} step={STEPS.length - 1}>
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-5">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden />
            <div className="space-y-3">
              <div>
                <p className="font-medium text-green-900">{terms?.formLabel ?? "This document"} is signed</p>
                <p className="text-sm text-green-800">
                  {enrolledAgent.name} can now speak to the IRS for you. The signed form is saved in your Documents.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LinkButton href={`/documents/${docId}`}>View the signed form</LinkButton>
                <LinkButton href="/action-items" variant="outline" className="bg-white">
                  Back to action items
                </LinkButton>
              </div>
            </div>
          </div>
          <SignatureCertificate record={existing} />
        </div>
      </Frame>
    );
  }

  if (!doc || !terms || doc.status !== "needs-signature") {
    return (
      <Frame docId={docId} step={0}>
        <StepCard title="Nothing to sign here" intro="This document doesn't need your signature right now.">
          <LinkButton href="/documents" variant="outline" className="w-fit">
            <ArrowLeft aria-hidden />
            All documents
          </LinkButton>
        </StepCard>
      </Frame>
    );
  }

  const fail = (message: string) => {
    const n = attempts + 1;
    setAttempts(n);
    const left = MAX_ATTEMPTS - n;
    setError(left > 0 ? `${message} ${left} ${left === 1 ? "try" : "tries"} left.` : null);
  };

  const sendCode = () => {
    if (ssn !== taxpayerIdentity.ssnLast4) return fail("Those digits don't match our records.");
    setError(null);
    setCodeSent(true);
    setCode("");
    log(`Code texted to ${taxpayerIdentity.phoneMasked}`);
  };

  const verifyCode = () => {
    if (code !== taxpayerIdentity.demoVerificationCode) return fail("That code isn't right.");
    setError(null);
    setVerified(true);
    log("Identity verified");
  };

  const canSign = method === "typed" ? matchesLegalName(typed) : drawing !== null;

  const sign = async () => {
    setSigning(true);
    const signedAt = timestamp();
    const fingerprint = await sha256(
      JSON.stringify({ docId, document: doc.name, signer: taxpayerIdentity.legalName, signedAt, method, typed, drawing })
    );
    const record: SignatureRecord = {
      docId,
      documentName: doc.name,
      signerName: taxpayerIdentity.legalName,
      method,
      typedName: method === "typed" ? typed.trim() : undefined,
      drawing: method === "drawn" ? (drawing ?? undefined) : undefined,
      signedAt,
      identityMethod: `Last 4 of SSN and a one-time code texted to ${taxpayerIdentity.phoneMasked}`,
      device: describeDevice(),
      ipAddress: DEMO_IP,
      fingerprint,
      audit: [
        ...audit,
        { label: `Signed ${terms.formLabel} (${method === "typed" ? "typed" : "drawn"} signature)`, at: signedAt },
        { label: "Sealed with a SHA-256 document fingerprint", at: signedAt },
      ],
    };
    recordSignature(record);
    setSigning(false);
    setStep(STEPS.length - 1);
  };

  return (
    <Frame docId={docId} step={step}>
      {step === 0 && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Form2848Pages taxMatters={terms.taxMatters} />
          </div>
          <div className="space-y-5 rounded-xl border bg-card p-6 lg:col-span-2">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Review {terms.formLabel}</h1>
              <p className="mt-1 text-sm text-muted-foreground">What you&apos;re agreeing to, in plain English.</p>
            </div>
            <ul className="space-y-3">
              {terms.agreeing.map((p) => (
                <li key={p} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <label htmlFor="sign-reviewed" className="flex items-start gap-3 rounded-lg bg-accent/60 p-3 text-sm">
              <input
                id="sign-reviewed"
                type="checkbox"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
                className="mt-0.5 size-4 accent-primary"
              />
              I&apos;ve read both pages and understand what {terms.formLabel} allows.
            </label>
            <Nav
              next={
                <Button
                  disabled={!reviewed}
                  onClick={() => {
                    log(`Opened and reviewed ${terms.formLabel} (2 pages)`);
                    setStep(1);
                  }}
                >
                  Continue
                  <ArrowRight aria-hidden />
                </Button>
              }
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <StepCard
          title="Agree to sign electronically"
          intro="Before you sign on screen, the law asks us to tell you a few things."
        >
          <ul className="space-y-3 text-sm">
            {[
              "Your electronic signature counts the same as signing on paper.",
              "You can ask for a paper copy of anything you sign, free, at any time.",
              "You can withdraw this consent by telling us. It won't undo anything you've already signed.",
              "You'll need a device that can open PDF files. A copy of the signed form is saved to your Documents.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <label htmlFor="sign-consent" className="flex items-start gap-3 rounded-lg bg-accent/60 p-3 text-sm">
            <input
              id="sign-consent"
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-0.5 size-4 accent-primary"
            />
            I agree to sign and receive documents electronically.
          </label>
          <Nav
            onBack={() => setStep(0)}
            next={
              <Button
                disabled={!consented}
                onClick={() => {
                  log("Agreed to sign electronically");
                  setStep(2);
                }}
              >
                Continue
                <ArrowRight aria-hidden />
              </Button>
            }
          />
        </StepCard>
      )}

      {step === 2 && (
        <StepCard title="Confirm it's you" intro="A quick check so nobody else can sign for you.">
          {locked ? (
            <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden />
              <div className="space-y-3">
                <p>
                  <span className="font-medium text-red-900">Too many tries.</span> For your security, {enrolledAgent.name} will
                  call you to confirm your identity before you can sign.
                </p>
                <LinkButton href={`/documents/${docId}`} variant="outline" size="sm" className="bg-white">
                  Back to the document
                </LinkButton>
              </div>
            </div>
          ) : verified ? (
            <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
              <p>
                <span className="font-medium text-green-900">Identity confirmed.</span> You can sign now.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Field id="sign-ssn" label="Last 4 digits of your Social Security number">
                    <input
                      id="sign-ssn"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={4}
                      value={ssn}
                      onChange={(e) => setSsn(e.target.value.replace(/\D/g, ""))}
                      className={cn(inputClass, "tracking-[0.3em]")}
                      disabled={codeSent}
                    />
                  </Field>
                </div>
                {!codeSent && (
                  <Button onClick={sendCode} disabled={ssn.length !== 4}>
                    <Smartphone aria-hidden />
                    Text me a code
                  </Button>
                )}
              </div>

              {codeSent && (
                <div className="space-y-3">
                  <p className="text-sm">
                    We texted a 6-digit code to <span className="font-medium">{taxpayerIdentity.phoneMasked}</span>.
                    <span className="ml-2 rounded-md border border-yellow-200 bg-yellow-50 px-1.5 py-0.5 font-mono text-xs text-yellow-800">
                      Demo code: {taxpayerIdentity.demoVerificationCode}
                    </span>
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <Field id="sign-code" label="Enter the code">
                        <input
                          id="sign-code"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && code.length === 6) verifyCode();
                          }}
                          className={cn(inputClass, "font-mono tracking-[0.4em]")}
                        />
                      </Field>
                    </div>
                    <Button onClick={verifyCode} disabled={code.length !== 6}>
                      Verify
                    </Button>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => {
                      setCode("");
                      log(`Code re-sent to ${taxpayerIdentity.phoneMasked}`);
                    }}
                  >
                    Send a new code
                  </Button>
                </div>
              )}

              {error && (
                <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="size-4" aria-hidden />
                  {error}
                </p>
              )}
            </div>
          )}
          <Nav
            onBack={() => setStep(1)}
            next={
              <Button disabled={!verified} onClick={() => setStep(3)}>
                Continue
                <ArrowRight aria-hidden />
              </Button>
            }
          />
        </StepCard>
      )}

      {step === 3 && (
        <StepCard
          title={`Sign ${terms.formLabel}`}
          intro={`Signing as ${taxpayerIdentity.legalName} · ${formatDate(MOCK_TODAY)}`}
        >
          <div role="group" aria-label="How to sign" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["typed", "drawn"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={method === m}
                onClick={() => setMethod(m)}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  method === m ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "typed" ? "Type" : "Draw"}
              </button>
            ))}
          </div>

          {method === "typed" ? (
            <div className="space-y-3">
              <Field id="sign-typed" label="Type your full legal name">
                <input
                  id="sign-typed"
                  autoComplete="off"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={taxpayerIdentity.legalName}
                  className={inputClass}
                />
              </Field>
              <div className="rounded-lg border bg-background px-5 pt-4 pb-3" aria-hidden>
                <p style={signatureFont} className={cn("min-h-10 text-3xl leading-tight", !typed && "text-muted-foreground/40")}>
                  {typed || taxpayerIdentity.legalName}
                </p>
                <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">Signature preview</p>
              </div>
              {typed.trim() && !matchesLegalName(typed) && (
                <p className="text-sm text-red-600">Please type your first and last name as they appear on your IRS records.</p>
              )}
            </div>
          ) : (
            <SignaturePad label={`Signature pad for ${taxpayerIdentity.legalName}`} onChange={setDrawing} />
          )}

          <p className="text-xs text-muted-foreground">
            By selecting Sign, I agree this is my legal signature on {terms.formLabel}, and that {enrolledAgent.name} may file it
            with the IRS.
          </p>
          <Nav
            onBack={() => setStep(2)}
            next={
              <Button disabled={!canSign || signing} onClick={sign}>
                {signing ? <Loader2 className="animate-spin" aria-hidden /> : <PenLine aria-hidden />}
                Sign {terms.formLabel}
              </Button>
            }
          />
        </StepCard>
      )}
    </Frame>
  );
}
