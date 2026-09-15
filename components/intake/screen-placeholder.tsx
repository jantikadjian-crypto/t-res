import { Construction } from "lucide-react";

// Which build chunk fills in each screen (docs/intake-wizard-scope.md → Build notes).
const chunkFor: Record<string, number> = {
  notice: 2,
  situation: 2,
  unfiled: 2,
  "income-types": 2,
  levy: 2,
  authorization: 2,
  "money-in": 3,
  "money-out": 3,
  assets: 3,
  documents: 3,
  assessment: 4,
  path: 4,
  done: 4,
};

// Stand-in body until the screen's inputs are built. Remove per screen as chunks land.
export function ScreenPlaceholder({ slug }: { slug: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
      <Construction className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>This screen&apos;s answers arrive in chunk {chunkFor[slug] ?? 2}. The frame, progress and navigation are live.</p>
    </div>
  );
}
