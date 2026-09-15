import { notFound } from "next/navigation";
import { ScreenPlaceholder } from "@/components/intake/screen-placeholder";
import { getScreen, intakeScreens } from "@/lib/intakeScreens";

export const dynamicParams = false;

export function generateStaticParams() {
  return intakeScreens.map((s) => ({ screen: s.slug }));
}

export default async function IntakeScreenPage(props: PageProps<"/intake/[screen]">) {
  const { screen } = await props.params;
  if (!getScreen(screen)) notFound();
  return <ScreenPlaceholder slug={screen} />;
}
