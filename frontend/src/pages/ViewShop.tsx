import React from "react";
import { useParams } from "react-router-dom";
import { shops } from "../data/mockData";
import { Link } from 'react-router-dom';
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const ViewShop: React.FC = () => {
  const { id } = useParams();
  const shop = shops.find((s) => s.id === Number(id));
  const items = shop ? shop.items : [];
  const navigate = useNavigate();
  const currentUser = { id: 1, name: "John Doe" }

  if (!shop) return <p>Shop not found.</p>;

  // Function to add shop to cart
  const addShopToCart = () => {
    // Get current cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if shop is already in cart
    if (!cart.find((s: any) => s.id === shop.id)) {
      cart.push({ id: shop.id, name: shop.name });
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${shop.name} added to cart!`);
    } else {
      alert(`${shop.name} is already in your cart.`);
    }
  };

  return (
    
    <div >
      <PageHeader title={shop.name} />
      <div>
     <Tabs defaultValue="Details">
        <TabsList className = "w-full">
          <TabsTrigger value="Details">Details</TabsTrigger>
          <TabsTrigger value="Catalogue">Catalogue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="Details">
          <div className = "flex flex-col gap-5 items-center m-5 align-center justify-center">
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
          <Button onClick = {addShopToCart} variant="outline" size="lg">Add Shop to Cart</Button>
        </div>
        <p>
          Found an item in store that is not in this list? 
          <br></br>
          Add it to the catalogue to let others know!
        </p>
        
        <Button onClick={() => navigate("/AddItem", { state: { userId: currentUser.id } })} variant="outline" size="lg">Add New Item</Button>
        </div>
        </TabsContent>
        
        <TabsContent value="Catalogue">
          <div className = "flex flex-col gap-5 items-center m-5 align-center justify-center">
          {items.map((item) => (
          <Link to={`/ViewItem/${item.id}`} key={item.id} className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
            <h2>{item.name}</h2>
            <p>{item.price}</p>
          </Link>))}
        </div>
          </TabsContent>
    
    </Tabs>
    </div>
    </div>
  );
}

export default ViewShop
