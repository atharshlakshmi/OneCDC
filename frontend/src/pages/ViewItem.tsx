import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { items, reviews } from "../data/mockData";
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


const ViewItem: React.FC = () => {
  const { id } = useParams();
  const item = items.find((i) => i.id === Number(id));
  const itemReviews = reviews.filter((r) => r.itemId === Number(id)); // Use filter, not find

  if (!item) return <p>Item not found.</p>;
  if (!item) return <p className="item-not-found">Item not found.</p>;

  return (
    <div>
      <PageHeader title={item.name} />
      <Tabs defaultValue="Details">
              <TabsList className = "w-full">
                <TabsTrigger value="Details">Details</TabsTrigger>
                <TabsTrigger value="Reviews">Reviews</TabsTrigger>
              </TabsList>
      
      <TabsContent value="Details">
         <div className = "flex flex-col gap-5 items-center m-5 align-center justify-center">
          <div className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
          <p>{item.name}</p>
          <p>
            <strong>Price:</strong> {item.price}
          </p>
          <Button variant="outline" size="lg">
          <Link to="/AddReview" state={{ itemId: item.id }}>
          </Link>
           Review Item 
        </Button>
          </div>
          
        </div>
      </TabsContent>
        
      <TabsContent value="Reviews">
         <div className = "flex flex-col gap-5 items-center m-5 align-center justify-center">
          {itemReviews.map((review) => (
          <div key={review.id} className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
            <h2>{review.rating}</h2>
            <p>{review.comment}</p>
          </div>))}
        </div>
      </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewItem;
