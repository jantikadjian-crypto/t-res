import type { Metadata } from "next";
import { SignFlow } from "@/components/signing/sign-flow";
import { signingTerms } from "@/lib/mockData";

export const metadata: Metadata = {
  title: "Sign · T-Res",
};

// Full-screen signing, outside the app shell. Signable documents come from signingTerms.
export function generateStaticParams() {
  return Object.keys(signingTerms).map((id) => ({ id }));
}

export default async function SignPage(props: PageProps<"/sign/[id]">) {
  const { id } = await props.params;
  return <SignFlow docId={id} />;
}
