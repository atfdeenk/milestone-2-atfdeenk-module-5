import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="inline-block">
      <h1 className="text-3xl font-bold">
        <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent hover:from-blue-600 hover:to-blue-500 transition-all duration-300">
          ShopSmart
        </span>
      </h1>
    </Link>
  );
}
