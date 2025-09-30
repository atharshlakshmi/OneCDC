"use client";
import Link from "next/link";
import { useCart } from "@/store/cart";

export default function Header() {
  const count = useCart((s) => s.entries.length);
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between p-3">
        <Link href="/" className="font-semibold">
          OneCDC
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/cart" className="text-sm">
            Cart{count ? ` (${count})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
