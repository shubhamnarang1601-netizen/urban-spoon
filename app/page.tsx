import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";

export default function Home() {
  const fresh = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <p className="eyebrow">New Collection</p>
          <h1>Festive edits, flat 25% off</h1>
          <p>Full suits, anarkalis and co-ord sets, made to make every occasion feel special.</p>
          <Link href="/shop?sort=new" className="btn">Shop New In</Link>
        </div>
      </section>

      <section className="container section">
        <h2>Shop by Category</h2>
        <div className="cat-grid">
          {CATEGORIES.map((c, i) => (
            <Link key={c} href={`/shop?category=${encodeURIComponent(c)}`} className="cat" style={{ background: PRODUCTS[i % PRODUCTS.length].tone[0] }}>
              <span>{c}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>New Arrivals</h2>
          <Link href="/shop?sort=new">View all →</Link>
        </div>
        <div className="grid">{fresh.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>

      <section className="perks">
        <div className="container perks-grid">
          <div><strong>Cash on Delivery</strong><span>Pay when it arrives</span></div>
          <div><strong>Easy Returns</strong><span>Hassle-free exchanges</span></div>
          <div><strong>Plus Sizes</strong><span>Up to 5XL</span></div>
          <div><strong>Wholesale</strong><span>Bulk enquiries welcome</span></div>
        </div>
      </section>
    </>
  );
}
