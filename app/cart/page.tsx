"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { getProduct, inr } from "@/lib/products";

export default function CartPage() {
  const { lines, setQty } = useCart();
  const rows = lines.flatMap((l) => {
    const p = getProduct(l.slug);
    return p ? [{ ...l, p }] : [];
  });
  const subtotal = rows.reduce((n, r) => n + r.p.price * r.qty, 0);
  const discount = subtotal >= 10000 ? Math.round(subtotal * 0.1) : 0;

  if (!rows.length)
    return (
      <div className="container section">
        <h1>Your bag is empty</h1>
        <Link href="/shop" className="btn">Continue shopping</Link>
      </div>
    );

  return (
    <div className="container section">
      <h1>Your Bag</h1>
      {rows.map((r) => (
        <div key={r.slug + r.size} className="line">
          <div className="thumb" style={{ background: `linear-gradient(160deg, ${r.p.tone[0]}, ${r.p.tone[1]})` }} />
          <div className="grow">
            <Link href={`/product/${r.slug}`}>{r.p.name}</Link>
            <div className="muted">Size {r.size} · {inr(r.p.price)}</div>
          </div>
          <div className="qty">
            <button onClick={() => setQty(r.slug, r.size, r.qty - 1)} aria-label="Decrease">−</button>
            <span>{r.qty}</span>
            <button onClick={() => setQty(r.slug, r.size, r.qty + 1)} aria-label="Increase">+</button>
          </div>
          <strong>{inr(r.p.price * r.qty)}</strong>
        </div>
      ))}
      <div className="summary">
        <p>Subtotal <span>{inr(subtotal)}</span></p>
        {discount > 0 && <p>10% order discount <span>−{inr(discount)}</span></p>}
        <p className="total">Total <span>{inr(subtotal - discount)}</span></p>
        <Link href="/checkout" className="btn">Checkout</Link>
      </div>
    </div>
  );
}
