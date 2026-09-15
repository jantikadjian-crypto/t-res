import { AssessmentScreen } from "@/components/intake/screens/assessment-screen";
import { AssetsScreen } from "@/components/intake/screens/assets-screen";
import { AuthorizationScreen } from "@/components/intake/screens/authorization-screen";
import { DocumentsScreen } from "@/components/intake/screens/documents-screen";
import { DoneScreen } from "@/components/intake/screens/done-screen";
import { IncomeTypesScreen } from "@/components/intake/screens/income-types-screen";
import { LevyScreen } from "@/components/intake/screens/levy-screen";
import { MoneyInScreen } from "@/components/intake/screens/money-in-screen";
import { MoneyOutScreen } from "@/components/intake/screens/money-out-screen";
import { NoticeScreen } from "@/components/intake/screens/notice-screen";
import { PathScreen } from "@/components/intake/screens/path-screen";
import { SituationScreen } from "@/components/intake/screens/situation-screen";
import { UnfiledScreen } from "@/components/intake/screens/unfiled-screen";

// The answer area for each wizard screen, shared by the Next page and the interactive
// progress artifact. Every screen in lib/intakeScreens.ts needs an entry here.
export const screenBodies: Record<string, React.ComponentType> = {
  notice: NoticeScreen,
  situation: SituationScreen,
  unfiled: UnfiledScreen,
  "income-types": IncomeTypesScreen,
  levy: LevyScreen,
  authorization: AuthorizationScreen,
  "money-in": MoneyInScreen,
  "money-out": MoneyOutScreen,
  assets: AssetsScreen,
  documents: DocumentsScreen,
  assessment: AssessmentScreen,
  path: PathScreen,
  done: DoneScreen,
};
