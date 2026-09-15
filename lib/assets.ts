// Files in public/ are served from the site root in the app. The progress artifact ships them next
// to its page instead, so scripts/build-artifact.mjs sets NEXT_PUBLIC_ASSET_BASE to "".
export function assetUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_ASSET_BASE ?? "/"}${path.replace(/^\//, "")}`;
}

// The artifact's sandbox can't open or download PDFs, so PDF buttons there go to IRS.gov instead.
export const IN_ARTIFACT = process.env.NEXT_PUBLIC_ARTIFACT === "1";
