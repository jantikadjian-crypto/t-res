import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SignatureRecord } from "@/components/case-provider";

export const signatureFont: React.CSSProperties = {
  fontFamily: '"Segoe Script", "Brush Script MT", "Lucida Handwriting", "Apple Chancery", cursive',
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

// Proof of who signed, when, how they proved it was them, and exactly what they signed.
export function SignatureCertificate({ record }: { record: SignatureRecord }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-green-600" aria-hidden />
          Signature certificate
        </CardTitle>
        <CardDescription>
          Who signed, when, and exactly what. Any change to the document after signing would change its fingerprint.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-background px-5 pt-4 pb-3">
          {record.method === "typed" ? (
            <p style={signatureFont} className="text-3xl leading-tight">
              {record.typedName}
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- a local data URL, not an optimisable asset
            <img src={record.drawing} alt={`Drawn signature of ${record.signerName}`} className="h-20 w-auto" />
          )}
          <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
            {record.signerName} · {record.signedAt}
          </p>
        </div>

        <dl className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-sm">
          <Row label="Document">{record.documentName}</Row>
          <Row label="Signed by">{record.signerName}</Row>
          <Row label="Signed on">{record.signedAt}</Row>
          <Row label="Method">{record.method === "typed" ? "Typed signature" : "Drawn signature"}</Row>
          <Row label="Identity check">{record.identityMethod}</Row>
          <Row label="Device">{record.device}</Row>
          <Row label="IP address">{record.ipAddress}</Row>
          <Row label="Fingerprint">
            <code className="font-mono text-xs break-all" title="SHA-256">
              {record.fingerprint}
            </code>
          </Row>
        </dl>

        <div>
          <p className="text-sm font-medium">Audit trail</p>
          <ol className="relative mt-3 space-y-3 border-l pl-5">
            {record.audit.map((e, i) => (
              <li key={`${e.label}-${i}`} className="relative">
                <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full bg-green-500 ring-4 ring-card" aria-hidden />
                <p className="text-sm">{e.label}</p>
                <p className="text-xs text-muted-foreground">{e.at}</p>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
