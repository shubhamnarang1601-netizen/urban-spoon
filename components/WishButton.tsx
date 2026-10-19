"use client";

import { useWishlist } from "./WishlistProvider";

export default function WishButton({ slug }: { slug: string }) {
  const { has, toggle } = useWishlist();
  const on = has(slug);
  return (
    <button
      className={`wish ${on ? "on" : ""}`}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => toggle(slug)}
    >
      {on ? "♥" : "♡"}
    </button>
  );
}
