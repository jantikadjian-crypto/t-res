import { notFound } from "next/navigation";
import { ScreenPlaceholder } from "@/components/intake/screen-placeholder";
import { AuthorizationScreen } from "@/components/intake/screens/authorization-screen";
import { IncomeTypesScreen } from "@/components/intake/screens/income-types-screen";
import { LevyScreen } from "@/components/intake/screens/levy-screen";
import { NoticeScreen } from "@/components/intake/screens/notice-screen";
import { SituationScreen } from "@/components/intake/screens/situation-screen";
import { UnfiledScreen } from "@/components/intake/screens/unfiled-screen";
import { getScreen, intakeScreens } from "@/lib/intakeScreens";

export const dynamicParams = false;

export function generateStaticParams() {
  return intakeScreens.map((s) => ({ screen: s.slug }));
}

// Screens without an entry still show the placeholder (chunks 3–4).
const screenBodies: Record<string, React.ComponentType> = {
  notice: NoticeScreen,
  situation: SituationScreen,
  unfiled: UnfiledScreen,
  "income-types": IncomeTypesScreen,
  levy: LevyScreen,
  authorization: AuthorizationScreen,
};

export default async function IntakeScreenPage(props: PageProps<"/intake/[screen]">) {
  const { screen } = await props.params;
  if (!getScreen(screen)) notFound();
  const Body = screenBodies[screen];
  return Body ? <Body /> : <ScreenPlaceholder slug={screen} />;
}
