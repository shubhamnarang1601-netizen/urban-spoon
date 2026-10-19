import Link from "next/link";

export default async function OrderPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <div className="container section">
      <h1>Thank you!</h1>
      <p>Your order {id && <strong>{id}</strong>} has been placed. We&apos;ll confirm it shortly.</p>
      <br />
      <Link href="/shop" className="btn">Keep shopping</Link>
    </div>
  );
}
