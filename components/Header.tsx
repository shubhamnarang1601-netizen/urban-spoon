"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/products";
import { useCart } from "./CartProvider";

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/shop?sort=new", label: "New In" },
    { href: "/shop?sale=1", label: "On Sale" },
    ...CATEGORIES.map((c) => ({ href: `/shop?category=${encodeURIComponent(c)}`, label: c })),
  ];

  return (
    <header className="header">
      <div className="announce">
        <span>Unlock 10% OFF on orders of ₹10,000 and above 🛍️</span>
      </div>
      <div className="header-main container">
        <button className="menu-btn" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
          ☰
        </button>
        <Link href="/" className="logo">
          Ranisa <small>Boutique</small>
        </Link>
        <Link href="/wishlist" className="cart-link" aria-label="Wishlist">
          ♡
        </Link>
        <Link href="/cart" className="cart-link" aria-label="Cart">
          Bag <span className="badge">{count}</span>
        </Link>
      </div>
      <nav className={`nav ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
        <div className="container nav-inner">
          {links.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
