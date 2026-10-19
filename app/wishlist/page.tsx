"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/components/WishlistProvider";
import { PRODUCTS } from "@/lib/products";

export default function WishlistPage() {
  const { slugs } = useWishlist();
  const items = PRODUCTS.filter((p) => slugs.includes(p.slug));
  return (
    <div className="container section">
      <h1>Your Wishlist</h1>
      {items.length ? (
        <div className="grid">{items.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      ) : (
        <>
          <p className="muted" style={{ marginBottom: 16 }}>Nothing saved yet.</p>
          <Link href="/shop" className="btn">Browse products</Link>
        </>
      )}
    </div>
  );
}
