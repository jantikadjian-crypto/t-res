import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { screenBodies } from "@/components/intake/screen-bodies";
import { getScreen, intakeScreens, intakeSteps } from "@/lib/intakeScreens";

export const dynamicParams = false;

export function generateStaticParams() {
  return intakeScreens.map((s) => ({ screen: s.slug }));
}

export async function generateMetadata(props: PageProps<"/intake/[screen]">): Promise<Metadata> {
  const { screen } = await props.params;
  const step = intakeSteps.find((s) => s.key === getScreen(screen)?.step);
  return { title: `${step?.label ?? "All done"} · Get Started · T-Res` };
}

export default async function IntakeScreenPage(props: PageProps<"/intake/[screen]">) {
  const { screen } = await props.params;
  const Body = screenBodies[screen];
  if (!getScreen(screen) || !Body) notFound();
  return <Body />;
}
