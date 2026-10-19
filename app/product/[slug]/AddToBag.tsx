"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { SIZES } from "@/lib/products";

export default function AddToBag({ slug }: { slug: string }) {
  const { add } = useCart();
  const [size, setSize] = useState<string>("M");
  const [added, setAdded] = useState(false);
  return (
    <>
      <div className="sizes">
        {SIZES.map((s) => (
          <button key={s} className={s === size ? "on" : ""} onClick={() => setSize(s)}>{s}</button>
        ))}
      </div>
      <button
        className="btn"
        onClick={() => {
          add(slug, size);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
      >
        {added ? "Added ✓" : "Add to Bag"}
      </button>
    </>
  );
}
