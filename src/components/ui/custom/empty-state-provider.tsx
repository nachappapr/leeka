"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "artha-empty-state";

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

interface EmptyStateContextValue {
  isEmpty: boolean;
  toggle: () => void;
}

const EmptyStateContext = createContext<EmptyStateContextValue | null>(null);

export function EmptyStateProvider({ children }: { children: ReactNode }) {
  const isEmpty = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next = !isEmpty;
    localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new Event("storage"));
  }, [isEmpty]);

  return (
    <EmptyStateContext.Provider value={{ isEmpty, toggle }}>{children}</EmptyStateContext.Provider>
  );
}

export function useEmptyState(): EmptyStateContextValue {
  const ctx = useContext(EmptyStateContext);
  if (!ctx) {
    throw new Error("useEmptyState must be used inside <EmptyStateProvider>");
  }
  return ctx;
}
