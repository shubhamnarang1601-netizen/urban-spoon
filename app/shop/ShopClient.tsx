"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS, discountPct } from "@/lib/products";

const SORTS = [
  ["featured", "Featured"],
  ["new", "Date, new to old"],
  ["low", "Price, low to high"],
  ["high", "Price, high to low"],
  ["az", "Alphabetically, A-Z"],
] as const;

export default function ShopClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const category = sp.get("category") ?? "";
  const sort = sp.get("sort") ?? "featured";
  const sale = sp.get("sale") === "1";
  const max = Number(sp.get("max")) || 0;

  const set = (k: string, v: string) => {
    const q = new URLSearchParams(sp.toString());
    if (v) q.set(k, v);
    else q.delete(k);
    router.replace(`/shop?${q.toString()}`);
  };

  let list = PRODUCTS.filter(
    (p) => (!category || p.category === category) && (!sale || discountPct(p) >= 25) && (!max || p.price <= max),
  );
  if (sort === "new") list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
  if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container section">
      <h1>{category || (sale ? "On Sale" : sort === "new" ? "New In" : "All Products")}</h1>
      <div className="toolbar">
        <select value={category} onChange={(e) => set("category", e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={String(max)} onChange={(e) => set("max", e.target.value === "0" ? "" : e.target.value)} aria-label="Max price">
          <option value="0">Any price</option>
          <option value="1500">Under ₹1,500</option>
          <option value="2500">Under ₹2,500</option>
          <option value="3500">Under ₹3,500</option>
        </select>
        <select value={sort} onChange={(e) => set("sort", e.target.value)} aria-label="Sort by">
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span className="muted">{list.length} products</span>
      </div>
      {list.length ? (
        <div className="grid">{list.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      ) : (
        <p className="muted">No products match these filters.</p>
      )}
    </div>
  );
}
