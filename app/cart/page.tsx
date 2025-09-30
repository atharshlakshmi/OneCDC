"use client";
import Link from "next/link";
import { useCart } from "@/store/cart";

export default function CartPage() {
  const { entries, removeShop, toggleSelected } = useCart();

  if (!entries.length) {
    return (
      <main className="min-h-dvh grid place-items-center p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow">
          <h1 className="mb-2 text-lg font-semibold">Your cart is empty</h1>
          <p className="mb-4 text-sm text-gray-600">Search and add shops to plan your route.</p>
          <Link href="/" className="inline-block rounded-lg bg-black px-4 py-2 text-white">
            Find shops
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-xl font-semibold">Your Cart</h1>
      <ul className="space-y-3">
        {entries.map(({ shop, itemTags, selected }) => (
          <li key={shop.id} className="rounded-2xl bg-white p-4 shadow">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{shop.name}</div>
                {shop.distanceKm != null && <div className="text-xs text-gray-500">{shop.distanceKm.toFixed(1)} km</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleSelected(shop.id)} className={`rounded-lg px-3 py-1 text-sm ${selected ? "bg-black text-white" : "bg-gray-100"}`}>
                  {selected ? "Selected" : "Select"}
                </button>
                <button onClick={() => removeShop(shop.id)} className="rounded-lg bg-red-50 px-3 py-1 text-sm text-red-600">
                  Remove
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {itemTags.map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <form action="/route" className="mt-6">
        <button className="w-full rounded-xl bg-black px-4 py-3 text-white">Generate Most Efficient Route</button>
      </form>
    </main>
  );
}
