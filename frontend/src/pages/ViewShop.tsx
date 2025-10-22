import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { shops } from "../data/mockData";
import { Link } from 'react-router-dom';
import BackButton from "@/components/BackButton"

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
      {/* Nav Bar */}
      <div className="flex items-center m-4 relative">
        <BackButton />
        <h1 className="absolute left-1/2 transform -translate-x-1/2">{shop.name}</h1>
      </div>


      <div className="flex justify-center w-full">
       <Tabs defaultValue="Details" className="w-[600px]">

        <TabsList>
          <TabsTrigger value="Details">Details</TabsTrigger>
          <TabsTrigger value="Catalogue">Catalogue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="Details">
          <div className = "list-container">
        <div className="list-card">
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
        </div>
            <button className="add-cart-button" onClick={addShopToCart}>Add Shop to Cart</button>
        </div>
        </TabsContent>
        
        <TabsContent value="Catalogue">
          <div className = "list-container">
          {items.map((item) => (
          <Link to={`/ViewItem/${item.id}`} key={item.id} className="list-card">
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
