import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1 style={{ color: "black" }}>SwapSpot</h1>
      <p style={{ color: "black" }}>Welcome to the SwapSpot barter system.</p>

      <Link
        href="/home"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-black"
      > 
        Go to Home
      </Link>
    </main>
  );
}