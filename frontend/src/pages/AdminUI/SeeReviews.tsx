import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import CardDisplay from "@/components/CardDisplay";
import { reviews, items, shops, users } from "../../data/mockData";

const SeeReviews: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = users.find((u) => u.id === 1);
  const userReviews = reviews.filter((r) => currentUser?.reviewIds.includes(r.id));

  const handleEdit = (id: number) => {
    navigate("/EditReview", { state: { reviewId: id, userId: currentUser?.id } });
  };


  const handleDelete = (id: number) =>
    confirm("Are you sure you want to delete this review?") && alert(`Deleted review #${id}`);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="My Reviews" />
      <div className="flex flex-col gap-5 items-center m-5 justify-center">
        {userReviews.map((review) => {
          const item = items.find((i) => i.id === review.itemId);
          const shop = shops.find((s) => s.items.some((it) => it.id === review.itemId));

          return (
            <CardDisplay
              key={review.id}
              title={item?.name || "Unknown Item"}
              subtitle={shop?.name}
              rating={review.rating}
              content={review.comment}
              onEdit={() => handleEdit(review.id)}
              onDelete={() => handleDelete(review.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SeeReviews;
