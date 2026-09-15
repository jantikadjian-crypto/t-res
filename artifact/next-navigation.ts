import { useSyncExternalStore } from "react";

// Stand-in for next/navigation in the progress artifact, where the path lives in the URL hash
// (e.g. #/documents/doc_cp504#notes → path /documents/doc_cp504, anchor "notes").

export function readHashPath(): string {
  const path = window.location.hash.slice(1).split("#")[0];
  return path.startsWith("/") ? path : `/${path}`;
}

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, readHashPath, () => "/");
}

export function useRouter() {
  return {
    push: (href: string) => {
      window.location.hash = href;
    },
    replace: (href: string) => {
      window.location.replace(`#${href}`);
    },
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function notFound(): never {
  throw new Error("Not found");
}

export function redirect(href: string): never {
  window.location.hash = href;
  throw new Error(`Redirected to ${href}`);
}
