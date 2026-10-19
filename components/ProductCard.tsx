import Link from "next/link";
import { discountPct, inr, type Product } from "@/lib/products";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="card-img" style={{ background: `linear-gradient(160deg, ${p.tone[0]}, ${p.tone[1]})` }}>
        {p.isNew && <span className="tag">New</span>}
        <span className="tag sale">{discountPct(p)}% off</span>
        <span className="card-cat">{p.category}</span>
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <p>
          <strong>{inr(p.price)}</strong> <s>{inr(p.mrp)}</s>
        </p>
      </div>
    </Link>
  );
}
