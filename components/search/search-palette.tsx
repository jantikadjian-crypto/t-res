"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, LayoutGrid, Search, type LucideIcon } from "lucide-react";
import { searchItems, tokenize, type SearchItem } from "@/lib/search";
import { cn } from "@/lib/utils";

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (tokens.length === 0) return <>{text}</>;
  const parts = text.split(new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-yellow-100 text-inherit">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// The search dialog itself. Both sides use it: the taxpayer app (CommandPalette) and T-Res Pro
// (ProCommandPalette) pass their own index, icons and copy, so neither can search into the other.
export function SearchPalette({
  items,
  icons,
  kindOrder,
  label,
  placeholder,
  suggestions,
  quickLinks,
  emptyHint,
  onClose,
}: {
  items: SearchItem[];
  icons: Record<string, LucideIcon>;
  kindOrder?: readonly string[];
  label: string;
  placeholder: string;
  suggestions: string[];
  quickLinks: SearchItem[];
  emptyHint: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const tokens = tokenize(query);
  const results = useMemo(
    () => (query.trim() ? searchItems(items, query, 40, kindOrder) : quickLinks),
    [items, query, kindOrder, quickLinks]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const open = (item: SearchItem) => {
    onClose();
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      open(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const setSearch = (value: string) => {
    setQuery(value);
    setActive(0);
  };

  const inputId = `search-${label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
      <button type="button" aria-label="Close search" tabIndex={-1} className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative flex max-h-[75vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border bg-card shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <label htmlFor={inputId} className="sr-only">
            {label}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-result-${active}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="h-13 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">Esc</kbd>
        </div>

        {!query.trim() && (
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 text-xs text-muted-foreground">
            <span>Try</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSearch(s);
                  inputRef.current?.focus();
                }}
                className="rounded-md border bg-background px-2 py-0.5 font-medium text-foreground hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {!query.trim() && <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">Go to</p>}
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing matches &ldquo;{query}&rdquo;. {emptyHint}
            </p>
          ) : (
            <ul ref={listRef} id="search-results" role="listbox" aria-label="Results">
              {results.map((item, i) => {
                const Icon = icons[item.kind] ?? LayoutGrid;
                return (
                  <li
                    key={item.id}
                    id={`search-result-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={i === active}
                    onMouseMove={() => setActive(i)}
                    onClick={() => open(item)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                      i === active ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        <Highlight text={item.title} tokens={tokens} />
                      </span>
                      {item.subtitle && (
                        <span className="block truncate text-xs text-muted-foreground">
                          <Highlight text={item.subtitle} tokens={tokens} />
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {item.kind}
                    </span>
                    {i === active && <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <span>↑ ↓ to move · Enter to open · Esc to close</span>
          {query.trim() && (
            <span aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
