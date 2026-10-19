import { notFound } from "next/navigation";
import AddToBag from "./AddToBag";
import { PRODUCTS, discountPct, getProduct, inr } from "@/lib/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  return (
    <div className="container section pdp">
      <div className="pdp-img" style={{ background: `linear-gradient(160deg, ${p.tone[0]}, ${p.tone[1]})` }} />
      <div>
        <p className="eyebrow">{p.category}</p>
        <h1>{p.name}</h1>
        <p className="price">
          <strong>{inr(p.price)}</strong> <s>{inr(p.mrp)}</s> <span className="tag sale">{discountPct(p)}% off</span>
        </p>
        <p className="muted">Colour: {p.color}</p>
        <p>{p.description}</p>
        <AddToBag slug={p.slug} />
      </div>
    </div>
  );
}
