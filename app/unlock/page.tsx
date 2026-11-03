import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/form";
import { DEMO_COOKIE, demoToken } from "@/lib/demoGate";

export const metadata: Metadata = { title: "Enter the demo password · T-Res" };

// Hosting-only: the gate in front of the whole deployment when DEMO_PASSWORD is set.
// Not a product sign-in; T-Res has no accounts in v1.
export default async function UnlockPage(props: PageProps<"/unlock">) {
  const { wrong, next } = await props.searchParams;
  const target = typeof next === "string" && next.startsWith("/") ? next : "/demo";

  async function unlock(formData: FormData) {
    "use server";
    const secret = process.env.DEMO_PASSWORD;
    const to = String(formData.get("next") || "/demo");
    if (!secret) redirect(to);
    if (String(formData.get("password") ?? "") !== secret) {
      redirect(`/unlock?wrong=1&next=${encodeURIComponent(to)}`);
    }
    const jar = await cookies();
    jar.set(DEMO_COOKIE, await demoToken(secret), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect(to);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-2xl leading-none font-extrabold tracking-tight text-primary">T-Res</div>
          <p className="mt-2 text-sm text-muted-foreground">A private prototype. Enter the password you were given.</p>
        </div>
        <form action={unlock} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <input type="hidden" name="next" value={target} />
          <Field id="demo-password" label="Demo password">
            <input id="demo-password" name="password" type="password" autoFocus autoComplete="current-password" className={inputClass} />
          </Field>
          {wrong && (
            <p role="alert" className="text-sm text-red-600">
              That password isn&apos;t right. Try again, or ask whoever shared the link.
            </p>
          )}
          <Button type="submit" className="w-full">
            <Lock aria-hidden />
            Open the demo
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Everything inside is a prototype with made-up people and figures. No real taxpayer information.
        </p>
      </div>
    </main>
  );
}
