"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { slugs: string[]; has: (s: string) => boolean; toggle: (s: string) => void };
const WishCtx = createContext<Ctx | null>(null);
const KEY = "ranisa-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSlugs(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(slugs));
    } catch {}
  }, [slugs, ready]);

  const toggle = (s: string) => setSlugs((a) => (a.includes(s) ? a.filter((x) => x !== s) : [...a, s]));
  return <WishCtx.Provider value={{ slugs, has: (s) => slugs.includes(s), toggle }}>{children}</WishCtx.Provider>;
}

export function useWishlist() {
  const c = useContext(WishCtx);
  if (!c) throw new Error("useWishlist must be used inside WishlistProvider");
  return c;
}
