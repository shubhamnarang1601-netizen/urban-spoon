"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { getProduct, inr } from "@/lib/products";

export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const router = useRouter();
  const [err, setErr] = useState("");

  const rows = lines.flatMap((l) => {
    const p = getProduct(l.slug);
    return p ? [{ ...l, p }] : [];
  });
  const subtotal = rows.reduce((n, r) => n + r.p.price * r.qty, 0);
  const total = subtotal - (subtotal >= 10000 ? Math.round(subtotal * 0.1) : 0);

  if (!rows.length)
    return (
      <div className="container section">
        <h1>Nothing to check out</h1>
        <Link href="/shop" className="btn">Continue shopping</Link>
      </div>
    );

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setErr("Enter a valid 10-digit mobile number.");
    if (!/^\d{6}$/.test(f.pincode)) return setErr("Enter a valid 6-digit pincode.");
    const id = "RB" + Date.now().toString(36).toUpperCase();
    try {
      localStorage.setItem("ranisa-last-order", JSON.stringify({ id, total, name: f.name, payment: f.payment }));
    } catch {}
    clear();
    router.push(`/order?id=${id}`);
  };

  return (
    <div className="container section checkout">
      <form onSubmit={submit}>
        <h1>Checkout</h1>
        <input name="name" placeholder="Full name" required />
        <input name="phone" placeholder="Mobile number" inputMode="numeric" required />
        <input name="address" placeholder="Address" required />
        <div className="two">
          <input name="city" placeholder="City" required />
          <input name="pincode" placeholder="Pincode" inputMode="numeric" required />
        </div>
        <select name="payment" defaultValue="cod" aria-label="Payment method">
          <option value="cod">Cash on Delivery</option>
          <option value="upi" disabled>UPI (coming soon)</option>
        </select>
        {err && <p className="error">{err}</p>}
        <button className="btn">Place order · {inr(total)}</button>
      </form>
    </div>
  );
}
