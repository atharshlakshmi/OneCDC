import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { items, reviews } from "../../data/mockData";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "../../context/AuthContext";

const ViewItem: React.FC = () => {
  const { id } = useParams();
  const item = items.find((i) => i.id === Number(id));
  const itemReviews = reviews.filter((r) => r.itemId === Number(id));
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUser = { id: 1, name: "John Doe" }; 

  if (!item) return <p>Item not found.</p>;

  const handleEdit = () => {
    navigate(`/EditItem/`, { state: { item } });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      console.log(`Deleting item ${item.id}`);
      // backend call would go here
    }
  };

  return (
    <div>
      <PageHeader title={item.name} />
      <Tabs defaultValue="Details">
        <TabsList className="w-full">
          <TabsTrigger value="Details">Details</TabsTrigger>
          <TabsTrigger value="Reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="Details">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            <div className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto">
              <p className="text-lg font-medium">{item.name}</p>
              <p>
                <strong>Price:</strong> {item.price}
              </p>

              {user?.role === "registered_shopper" && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    navigate("/AddReview", {
                      state: { itemId: item.id, userId: currentUser.id },
                    })
                  }
                >
                  Review Item
                </Button>
              )}

              {user?.role === "owner" && (
                <div className="flex gap-4 mt-4">
                  <Button variant="outline" size="lg" onClick={handleEdit}>
                    Edit Item
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleDelete}
                  >
                    Delete Item
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="Reviews">
          <div className="flex flex-col gap-5 items-center m-5 justify-center">
            {itemReviews.length === 0 ? (
              <p className="text-gray-500 italic">No reviews yet.</p>
            ) : (
              itemReviews.map((review) => (
                <div
                  key={review.id}
                  className="w-full rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-4 items-center text-center mx-auto"
                >
                  <h2>⭐ {review.rating}/5</h2>
                  <p className="italic text-gray-700">“{review.comment}”</p>

                  <Button
                    onClick={() =>
                      navigate("/ReportReview", {
                        state: {
                          reviewId: review.id,
                          reviewerId: review.reviewerId,
                          reporterId: currentUser.id,
                        },
                      })
                    }
                    variant="outline"
                    size="sm"
                  >
                    Report
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewItem;
