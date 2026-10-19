"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartLine = { slug: string; size: string; qty: number };

type CartCtx = {
  lines: CartLine[];
  count: number;
  add: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ranisa-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = (slug: string, size: string) =>
    setLines((ls) => {
      const hit = ls.find((l) => l.slug === slug && l.size === size);
      return hit
        ? ls.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l))
        : [...ls, { slug, size, qty: 1 }];
    });

  const setQty = (slug: string, size: string, qty: number) =>
    setLines((ls) =>
      ls.flatMap((l) => (l.slug === slug && l.size === size ? (qty > 0 ? [{ ...l, qty }] : []) : [l])),
    );

  return (
    <Ctx.Provider
      value={{ lines, count: lines.reduce((n, l) => n + l.qty, 0), add, setQty, clear: () => setLines([]) }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
