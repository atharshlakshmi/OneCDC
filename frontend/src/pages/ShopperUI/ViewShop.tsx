import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Loader2, MapPin, Phone, Clock } from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  price: string;
}

interface CatalogueItem {
  _id?: string; // MongoDB ObjectId
  name: string;
  description?: string;
  price: number;
  availability: boolean;
  images?: string[];
  category?: string;
  cdcVoucherAccepted?: boolean;
}

interface OperatingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface Shop {
  id: string;
  name: string;
  details: string;
  address: string;
  contact_number: string;
  operating_hours: string;
  operatingHours?: OperatingHours[];
  images?: string[];
  items: ShopItem[];
  category?: string;
}

interface Catalogue {
  _id: string;
  items: CatalogueItem[];
}

const ViewShop: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [shop, setShop] = useState<Shop | null>(null);
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch shop details
  useEffect(() => {
    const fetchShop = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const response = await apiGet<Shop>(`/shops/${id}`);
        console.log("Shop data received:", response);
        console.log("Operating hours array:", response.operatingHours);
        setShop(response);
      } catch (error: any) {
        console.error("Failed to fetch shop:", error);
        toast.error("Failed to load shop details");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id]);

  // Fetch catalogue
  useEffect(() => {
    const fetchCatalogue = async () => {
      if (!id) return;

      setCatalogueLoading(true);
      try {
        const response = await apiGet<{ success: boolean; data: Catalogue }>(`/search/shops/${id}/catalogue`);
        console.log("Catalogue response:", response);

        // Check if response has the expected structure
        if (response?.data?.items && Array.isArray(response.data.items)) {
          setCatalogue(response.data.items);
        } else if (Array.isArray(response)) {
          // If response is directly an array
          setCatalogue(response);
        } else {
          console.warn("Unexpected catalogue response format:", response);
          setCatalogue([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch catalogue:", error);
        // Don't show error toast - shop might not have a catalogue yet
        setCatalogue([]);
      } finally {
        setCatalogueLoading(false);
      }
    };

    fetchCatalogue();
  }, [id]);

  // Check if current user owns this shop
  useEffect(() => {
    const checkOwnership = async () => {
      if (!shop || !user || user.role !== "owner") {
        return;
      }

      try {
        const response = await apiGet<{ success: boolean; data: any[] }>("/owner/shops");
        const ownerShops = response?.data || [];
        const ownsShop = ownerShops.some((s: any) => s._id === shop.id);
        setIsOwner(ownsShop);
      } catch (error) {
        console.error("Failed to check shop ownership:", error);
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [shop, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-3 text-gray-600">Loading shop...</span>
      </div>
    );
  }

  if (!shop) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">Shop not found.</div>;
  }

  // Function to add shop to cart
  const addShopToCart = async () => {
    try {
      // Debug: Log the shop object to see what data is available
      console.log("Shop object:", shop);
      console.log("Shop category:", shop.category);

      // Call backend API to add shop to cart
      const response = await apiPost("/cart/add", {
        shopId: shop.id,
      });

      // Check if shop was already in cart
      if (response?.alreadyInCart) {
        toast.info(`${shop.name} is already in your cart.`);
      } else {
        toast.success(`${shop.name} added to cart!`);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to add shop to cart");
      console.error("Error adding shop to cart:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title={shop.name} />
      <Tabs defaultValue="About">
        <TabsList className="w-full bg-transparent">
          <TabsTrigger value="About" className="data-[state=active]:bg-amber-400 data-[state=active]:text-white text-lg">
            About
          </TabsTrigger>
          <TabsTrigger value="Catalogue" className="data-[state=active]:bg-amber-400 data-[state=active]:text-white text-lg">
            Catalogue
          </TabsTrigger>
        </TabsList>

        {/* Shop Details Tab */}
        <TabsContent value="About">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            <div className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-6 mx-auto">
              {/* Shop Image */}
              {shop.images && shop.images.length > 0 && (
                <div className="w-full rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <img src={shop.images[0]} alt={shop.name} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200" />
                </div>
              )}

              <p className="text-gray-800 text-left">{shop.details}</p>

              <div className="flex items-center gap-3 text-gray-800 text-left">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <p>
                  <strong>Address:</strong> {shop.address}
                </p>
              </div>

              <div className="flex items-center gap-3 text-gray-800 text-left">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <p>
                  <strong>Contact:</strong> {shop.contact_number}
                </p>
              </div>

              <div className="flex items-start gap-3 text-gray-800 text-left">
                <Clock className="w-5 h-5 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-bold mb-2">Operating Hours:</p>
                  {shop.operatingHours && shop.operatingHours.length > 0 ? (
                    <div className="space-y-1">
                      {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, index) => {
                        const dayHours = shop.operatingHours?.find((h) => h.dayOfWeek === index);
                        return (
                          <div key={index} className="flex gap-2 text-sm">
                            <span className="font-medium w-24">{dayName}:</span>
                            <span className="text-gray-600">
                              {dayHours?.isClosed ? "Closed" : dayHours ? `${dayHours.openTime.replace(":", "")}-${dayHours.closeTime.replace(":", "")}H` : "Hours not available"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">{shop.operating_hours || "Operating hours not available"}</p>
                  )}
                </div>
              </div>

              {/* Conditional buttons based on user role */}
              <div className="flex flex-col items-center gap-2 mt-4">
                {user?.role === "registered_shopper" ? (
                  <>
                    <Button onClick={addShopToCart} className="bg-amber-400 text-white hover:bg-amber-500 text-lg py-6 px-12 shadow-lg">
                      Add Shop to Cart
                    </Button>
                    <button
                      onClick={() =>
                        navigate("/ReportShop", {
                          state: { shopId: shop.id, reporterId: user._id },
                        })
                      }
                      className="text-gray-600 text-sm underline hover:text-gray-800"
                    >
                      Report Shop
                    </button>
                  </>
                ) : user?.role === "owner" && isOwner ? (
                  <Button
                    onClick={() => navigate("/EditShop", { state: { shopId: shop.id } })}
                    className="bg-blue-900 text-white hover:bg-blue-800 w-full max-w-md shadow-lg"
                    size="lg"
                  >
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
            {catalogueLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <span className="ml-3 text-gray-600">Loading catalogue...</span>
              </div>
            ) : catalogue.length === 0 ? (
              <div className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 mx-auto">
                <p className="text-gray-500 text-center italic">No items in catalogue yet.</p>
              </div>
            ) : (
              catalogue.map((item) => (
                <Link
                  to={`/ViewItem/${item._id || item.name}`}
                  key={item._id || item.name}
                  className="w-full rounded-2xl bg-white shadow-lg p-6 sm:p-8 flex flex-col gap-3 mx-auto hover:bg-gray-50 transition-colors"
                >
                  {/* Item Image */}
                  {item.images && item.images.length > 0 && (
                    <div className="w-full rounded-lg overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                      <img src={item.images[0]} alt={item.name} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200" />
                    </div>
                  )}

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h2>
                      {item.category && <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{item.category}</span>}
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      {item.price != null && <p className="text-xl font-bold text-amber-600">${Number(item.price).toFixed(2)}</p>}
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${item.availability ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {item.availability ? "Available" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}

            {user?.role === "registered_shopper" && (
              <>
                <p className="text-center text-gray-600">
                  Found an item in store that is not in this list?
                  <br />
                  Add it to the catalogue to let others know!
                </p>
                <Button onClick={() => navigate(`/AddItem/${shop.id}`)} size="lg" className="bg-amber-400 text-white hover:bg-amber-500 shadow-lg">
                  Add New Item
                </Button>
              </>
            )}

            {user?.role === "owner" && (
              <Button onClick={() => navigate(`/AddItem/${shop.id}`)} size="lg" className="bg-amber-400 text-white hover:bg-amber-500 shadow-lg">
                Add New Item
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewShop;
