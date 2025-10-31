import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { shops } from "../data/mockData";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ViewShop: React.FC = () => {
  const { id } = useParams();
  const shop = shops.find((s) => s.id === Number(id));
  const items = shop ? shop.items : [];
  const navigate = useNavigate();

  const currentUser = { id: 1, name: "John Doe" };
  const userType = "Shopper"; // Change this between "Shopper" and "Owner" to test view

  if (!shop) return <p>Shop not found.</p>;

  // Function to add shop to cart
  const addShopToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (!cart.find((s: any) => s.id === shop.id)) {
      cart.push({ id: shop.id, name: shop.name });
      localStorage.setItem("cart", JSON.stringify(cart));
      toast.success(`${shop.name} added to cart!`);
    } else {
      toast.info(`${shop.name} is already in your cart.`);
    }
  };

  return (
    <div>
      <PageHeader title={shop.name} />
      <Tabs defaultValue="Details">
        <TabsList className="w-full">
          <TabsTrigger value="Details">Details</TabsTrigger>
          <TabsTrigger value="Catalogue">Catalogue</TabsTrigger>
        </TabsList>

        {/* Shop Details Tab */}
        <TabsContent value="Details">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            <div className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
              <p>{shop.details}</p>
              <p>
                <strong>Address:</strong> {shop.address}
              </p>
              <p>
                <strong>Contact:</strong> {shop.contact_number}
              </p>
              <p>
                <strong>Operating Hours:</strong> {shop.operating_hours}
              </p>

              {/* Conditional buttons based on userType */}
              <div className="flex gap-4 mt-4">
                {userType === "Shopper" ? (
                  <>
                    <Button onClick={addShopToCart} variant="outline" size="lg">
                      Add Shop to Cart
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
                ) : (
                  <Button onClick={() => navigate("/EditShop", { state: { shopId: shop.id } })} className="bg-blue-900 text-white hover:bg-blue-800" size="lg">
                    Edit Shop Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Catalogue Tab */}
        <TabsContent value="Catalogue">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            {items.map((item) => (
              <Link to={`/ViewItem/${item.id}`} key={item.id} className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
                <h2>{item.name}</h2>
                <p>{item.price}</p>
                {item.status === "Not available" ? <p className="text-red-700 font-medium">{item.status}</p> : <p className="text-green-700 font-medium">{item.status}</p>}
              </Link>
            ))}

            {userType === "Shopper" && (
              <>
                <p className="text-center">
                  Found an item in store that is not in this list?
                  <br />
                  Add it to the catalogue to let others know!
                </p>
              </>
            )}
            <Button
              onClick={() =>
                navigate("/AddItem", {
                  state: { userId: currentUser.id, shopID: shop.id },
                })
              }
              variant="outline"
              size="lg"
            >
              Add New Item
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewShop;
