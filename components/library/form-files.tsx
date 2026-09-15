import { Download, ExternalLink } from "lucide-react";
import { assetUrl, IN_ARTIFACT } from "@/lib/assets";
import { formatDate, formatFileSize } from "@/lib/format";
import { irsFiles, type IrsFile } from "@/lib/irsFiles";

const buttonBase =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function FormFileCard({ file }: { file: IrsFile }) {
  // Local copy in the app; the official IRS file in the progress artifact.
  const pdf = IN_ARTIFACT ? file.sourceUrl : assetUrl(`forms/${file.file}`);
  const sample = file.kind === "Sample notice";

  return (
    <figure className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <a
        href={pdf}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${file.title} (PDF, opens in a new tab)`}
        className="group block border-b bg-muted/40 p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static previews rendered by scripts/irs-forms.mjs */}
        <img
          src={assetUrl(`forms/${file.preview}`)}
          alt={`Page 1 of ${file.title}`}
          loading="lazy"
          className="aspect-[8.5/11] w-full max-w-full rounded-sm bg-white object-cover object-top shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-[1.01]"
        />
      </a>
      <figcaption className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{file.kind}</p>
          <p className="font-medium">{file.title}</p>
          <p className="text-xs text-muted-foreground">
            {file.pages} {file.pages === 1 ? "page" : "pages"} · PDF · {formatFileSize(file.sizeKb)}
            {file.revised && ` · IRS revision ${formatDate(file.revised)}`}
          </p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          <a href={pdf} target="_blank" rel="noopener noreferrer" className={`${buttonBase} bg-primary text-primary-foreground hover:bg-primary/80`}>
            Open PDF
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
          {!IN_ARTIFACT && (
            <a href={pdf} download={file.file} className={`${buttonBase} border bg-background hover:bg-accent`}>
              <Download className="size-3.5" aria-hidden />
              Download
            </a>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {sample ? "IRS sample with made-up details. It isn't your notice." : "Blank copy from IRS.gov (public domain)."}{" "}
          <a href={file.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            Source
          </a>
        </p>
      </figcaption>
    </figure>
  );
}

export function FormFiles({ files }: { files: string[] }) {
  const list = files.map((f) => irsFiles[f]).filter((f): f is IrsFile => f !== undefined);
  if (list.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {list.map((f) => (
        <FormFileCard key={f.file} file={f} />
      ))}
    </div>
  );
}
