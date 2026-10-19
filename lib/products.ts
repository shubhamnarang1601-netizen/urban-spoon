export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  color: string;
  tone: [string, string];
  isNew?: boolean;
  description: string;
};

export const CATEGORIES = [
  "Full Suits",
  "Co-Ord Sets",
  "Anarkali",
  "Kurta Pant",
  "Sarees",
  "Indo Western",
  "Kurtis",
  "Plus Size",
] as const;

export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

const seed: Omit<Product, "slug" | "mrp">[] = [
  { name: "Mulmul Floral Full Suit", category: "Full Suits", price: 1899, color: "Mint Green", tone: ["#cfe8dc", "#9ccab5"], isNew: true, description: "Soft cotton suit with hand-block floral print, straight pant and chiffon dupatta." },
  { name: "Banarasi Party Wear Anarkali", category: "Anarkali", price: 3499, color: "Wine", tone: ["#8a2a45", "#5c1830"], isNew: true, description: "Flared anarkali with zari woven yoke and full-sleeve detailing." },
  { name: "Casual Cotton Co-Ord Set", category: "Co-Ord Sets", price: 1599, color: "Dusty Pink", tone: ["#f0cfd0", "#d99aa0"], isNew: true, description: "Relaxed two-piece co-ord in breathable cotton, easy for everyday wear." },
  { name: "Chanderi Kurta Pant Set", category: "Kurta Pant", price: 2199, color: "Mustard", tone: ["#e6b94a", "#c18f1f"], description: "Lightweight chanderi kurta with matching pant and gota-lace border." },
  { name: "Georgette Drape Saree", category: "Sarees", price: 2799, color: "Teal Blue", tone: ["#2e7f86", "#1b5359"], isNew: true, description: "Ready-to-drape georgette saree with sequin border and stitched blouse." },
  { name: "Indo-Western Cape Set", category: "Indo Western", price: 3299, color: "Lavender", tone: ["#cdbfe6", "#a08fd0"], description: "Three-piece cape set with embroidered shoulders and palazzo." },
  { name: "Straight Cut Printed Kurti", category: "Kurtis", price: 899, color: "Off White", tone: ["#f3ece0", "#d9ccb4"], description: "Everyday printed kurti with three-quarter sleeves." },
  { name: "Plus Size Anarkali Gown", category: "Plus Size", price: 2499, color: "Bottle Green", tone: ["#2f6b4f", "#184030"], isNew: true, description: "Generous flare anarkali designed for comfort in sizes up to 5XL." },
  { name: "Premium Co-Ord Embroidered", category: "Co-Ord Sets", price: 2899, color: "Peach", tone: ["#f7d2b8", "#ebaa84"], description: "Thread-work embroidered top with matching skirt." },
  { name: "Fancy Full Suit Sharara", category: "Full Suits", price: 3199, color: "Rani Pink", tone: ["#d6336c", "#9c1c4c"], description: "Festive sharara suit with sequin kurta and net dupatta." },
  { name: "Casual Anarkali Kurti", category: "Anarkali", price: 1799, color: "Sea Blue", tone: ["#7fb9d6", "#4d8fb0"], description: "Easy-wear flared anarkali in rayon." },
  { name: "Surat Mul-Chanderi Suit", category: "Full Suits", price: 2399, color: "Rust", tone: ["#b5532e", "#80361a"], description: "Rich rust chanderi suit with contrast dupatta." },
];

export const PRODUCTS: Product[] = seed.map((p) => ({
  ...p,
  slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  mrp: Math.round((p.price * 1.4) / 100) * 100 - 1,
}));

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const discountPct = (p: Product) => Math.round(((p.mrp - p.price) / p.mrp) * 100);
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
