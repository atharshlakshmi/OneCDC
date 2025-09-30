"use client";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";

export default function Home() {
  const r = useRouter();
  const addAndGo = () => {
    useCart.getState().addShopWithTag({ id: "shop-1", name: "Example Shop" }, "batteries");
    r.push("/cart");
  };

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <button onClick={addAndGo} className="rounded bg-black px-4 py-2 text-white">
        Add Example Shop → View Cart
      </button>
    </main>
  );
}
