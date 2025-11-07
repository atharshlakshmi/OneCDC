import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api";

type Shop = {
  id: string;
  name: string;
  address: string;
  ownerVerified?: boolean;
};

export default function Home() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Fetch shops from backend API
        const resp = await apiFetch("/shops", { method: "GET" });
        const data = resp?.data ?? resp;

        if (!active) return;

        // Map the response to our Shop type
        const shopsData = Array.isArray(data) ? data : [];
        setShops(shopsData);
      } catch (err: any) {
        if (!active) return;
        console.error("Failed to fetch shops:", err);
        setError(err?.message || "Failed to load shops");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-5 items-center m-5 justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-amber-400" size={48} />
        <p className="text-gray-600">Loading shops...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5 items-center m-5 justify-center min-h-[50vh]">
        <p className="text-red-600 text-lg">Error: {error}</p>
        <p className="text-gray-600 text-sm">Please make sure the backend server is running.</p>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="flex flex-col gap-5 items-center m-5 justify-center min-h-[50vh]">
        <p className="text-gray-600 text-lg">No shops available yet.</p>
        <p className="text-gray-500 text-sm">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 items-center m-5 align-center justify-center">
      {shops.map((shop) => (
        <Link
          to={`/ViewShop/${shop.id}`}
          key={shop.id}
          className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto hover:shadow-xl transition-shadow"
        >
          <div className="flex flex-row items-center justify-center gap-2">
            <h2 className="text-xl text-amber-400">{shop.name}</h2>
            {shop.ownerVerified && (
              <BadgeCheck className="text-green-700" size={20} />
            )}
          </div>

          <p className="text-gray-600">{shop.address}</p>
        </Link>
      ))}
    </div>
  );
}
