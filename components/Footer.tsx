import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>Ranisa Boutique</h4>
          <p>Ethnic wear for every celebration — suits, anarkalis, co-ords and sarees.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link href="/shop?sort=new">New In</Link>
          <Link href="/shop?sale=1">On Sale</Link>
          <Link href="/shop">All Products</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link href="/cart">Your Bag</Link>
          <span>Easy returns · Cash on delivery</span>
        </div>
      </div>
      <div className="copy">© {new Date().getFullYear()} Ranisa Boutique</div>
    </footer>
  );
}
