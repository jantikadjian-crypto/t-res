import { notFound } from "next/navigation";
import { screenBodies } from "@/components/intake/screen-bodies";
import { ScreenPlaceholder } from "@/components/intake/screen-placeholder";
import { getScreen, intakeScreens } from "@/lib/intakeScreens";

export const dynamicParams = false;

export function generateStaticParams() {
  return intakeScreens.map((s) => ({ screen: s.slug }));
}

export default async function IntakeScreenPage(props: PageProps<"/intake/[screen]">) {
  const { screen } = await props.params;
  if (!getScreen(screen)) notFound();
  const Body = screenBodies[screen];
  return Body ? <Body /> : <ScreenPlaceholder slug={screen} />;
}
