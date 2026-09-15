import { redirect } from "next/navigation";
import { FIRST_SCREEN } from "@/lib/intakeScreens";

export default function IntakePage() {
  redirect(`/intake/${FIRST_SCREEN}`);
}
