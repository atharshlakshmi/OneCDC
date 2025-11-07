import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BadgeCheck } from "lucide-react";

type Item = {
  id: string;
  name: string;
  price: string;
  status?: string;
};

type Shop = {
  id: string;
  name: string;
  details: string;
  address: string;
  contact_number: string;
  operating_hours: string;
  ownerId?: string; // Add owner ID field
  ownerVerified?: boolean;
  items: Item[];
};

const ViewShop: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const userType = user?.role === "owner" ? "Owner" : "Shopper";
  const currentUser = { id: user?._id || "1", name: user?.name || "User" };

  // Check if current user is the owner of this shop
  const isShopOwner = user?.role === "owner" && shop?.ownerId === user?._id;

  // Fetch shop data from backend
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const resp = await apiFetch(`/shops/${id}`, { method: "GET" });
        const data = resp?.data ?? resp;

        if (!active) return;
        setShop(data);
      } catch (err: any) {
        if (!active) return;
        console.error("Failed to fetch shop:", err);
        setError(err?.message || "Failed to load shop");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Function to add shop to cart using backend API
  const addShopToCart = async () => {
    if (!user) {
      alert("Please login to add shops to cart");
      navigate("/login");
      return;
    }

    if (user.role === "owner") {
      alert("Owners cannot add shops to cart");
      return;
    }

    setAddingToCart(true);

    try {
      await apiFetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: id,
          itemTag: "general",
        }),
      });

      alert(`${shop?.name} added to cart!`);
    } catch (err: any) {
      if (err?.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }

      if (err?.message?.includes("already") || err?.status === 400) {
        alert(`${shop?.name} is already in your cart.`);
      } else {
        alert(err?.message || "Failed to add shop to cart");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading..." />
        <div className="flex flex-col gap-5 items-center m-5 justify-center min-h-[40vh]">
          <Loader2 className="animate-spin text-amber-400" size={48} />
          <p className="text-gray-600">Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div>
        <PageHeader title="Shop Not Found" />
        <div className="flex flex-col gap-5 items-center m-5 justify-center min-h-[40vh]">
          <p className="text-red-600 text-lg">{error || "Shop not found"}</p>
          <Button onClick={() => navigate("/")} className="bg-amber-400 hover:bg-amber-500 text-white">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const items = shop.items || [];

  return (
    <div>
      <div className="relative">
        <PageHeader title={shop.name} />
        {shop.ownerVerified && (
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            <BadgeCheck size={16} />
            Verified
          </div>
        )}
      </div>

      <Tabs defaultValue="Details">
        <TabsList className="w-full">
          <TabsTrigger value="Details">Details</TabsTrigger>
          <TabsTrigger value="Catalogue">Catalogue</TabsTrigger>
        </TabsList>

        {/* Shop Details Tab */}
        <TabsContent value="Details">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            <div className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
              <p className="text-gray-700">{shop.details}</p>
              <p className="text-gray-600">
                <strong>Address:</strong> {shop.address}
              </p>
              <p className="text-gray-600">
                <strong>Contact:</strong> {shop.contact_number}
              </p>
              <p className="text-gray-600">
                <strong>Operating Hours:</strong> {shop.operating_hours}
              </p>

              {/* Conditional buttons based on userType and ownership */}
              <div className="flex gap-4 mt-4">
                {userType === "Shopper" ? (
                  <>
                    <Button onClick={addShopToCart} variant="outline" size="lg" disabled={addingToCart}>
                      {addingToCart ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={16} />
                          Adding...
                        </>
                      ) : (
                        "Add Shop to Cart"
                      )}
                    </Button>
                    <Button
                      onClick={() =>
                        navigate("/ReportShop", {
                          state: { shopId: shop.id, reporterId: currentUser.id },
                        })
                      }
                      variant="destructive"
                      size="lg"
                    >
                      Report Shop
                    </Button>
                  </>
                ) : isShopOwner ? (
                  // Only show edit button if user is the actual owner of this shop
                  <Button onClick={() => navigate("/EditShop", { state: { shopId: shop.id } })} className="bg-blue-900 text-white hover:bg-blue-800" size="lg">
                    Edit Shop Details
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Catalogue Tab */}
        <TabsContent value="Catalogue">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            {items.length === 0 ? (
              <div className="w-full rounded-2xl bg-white shadow-lg p-8 text-center">
                <p className="text-gray-500">No items in catalogue yet.</p>
              </div>
            ) : (
              items.map((item) => (
                <Link
                  to={`/ViewItem/${item.id}`}
                  key={item.id}
                  className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto hover:shadow-xl transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                  <p className="text-amber-600 font-medium">{item.price}</p>
                  {item.status && <p className={item.status === "Not available" ? "text-red-700 font-medium" : "text-green-700 font-medium"}>{item.status}</p>}
                </Link>
              ))
            )}

            {userType === "Shopper" && (
              <p className="text-center text-gray-600 mt-4">
                Found an item in store that is not in this list?
                <br />
                Add it to the catalogue to let others know!
              </p>
            )}

            {/* Only show Add Item button for shoppers or the shop owner */}
            {(userType === "Shopper" || isShopOwner) && (
              <Button
                onClick={() => {
                  if (isShopOwner) {
                    // Owner should use the proper catalogue management
                    navigate(`/ManageCatalogue/${shop.id}`);
                  } else {
                    // Shoppers use the AddItem page
                    navigate(`/AddItem/${shop.id}`);
                  }
                }}
                variant="outline"
                size="lg"
              >
                {isShopOwner ? "Manage Catalogue" : "Add New Item"}
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewShop;
