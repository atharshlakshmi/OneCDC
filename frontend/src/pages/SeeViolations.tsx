import React from "react";
import PageHeader from "@/components/PageHeader";
import CardDisplay from "@/components/CardDisplay";
import { shops, reviews, users, items } from "../data/mockData";

const SeeViolations: React.FC = () => {
  const currentUser = users.find((u) => u.id === 2); // Example: Bob Smith

  const violations = [
    {
      id: 1,
      reportedBy: "Jane Doe",
      reason: "Spam content",
      status: "Resolved",
      reviewId: 2,
    },
    {
      id: 2,
      reportedBy: "Alice Tan",
      reason: "Inappropriate reply",
      status: "Pending",
      reviewId: 3,
    },
  ];

  const confirmedCount = violations.filter(
    (v) => v.status === "Resolved"
  ).length;

  const handleEdit = (violationId: number) => {
    console.log(`Edit violation ${violationId}`);
  };

  const handleDelete = (violationId: number) => {
    if (window.confirm("Are you sure you want to delete this violation?")) {
      console.log(`Delete violation ${violationId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Reports Against Me" />

      {/* Confirmed count */}
      <div className="text-center text-gray-600 text-sm mt-2">
        Confirmed Violations: <span className="font-medium">{confirmedCount}</span>
      </div>

      {/* Violations List */}
      <div className="flex flex-col gap-5 items-center m-5 justify-center">
        {violations.map((violation) => {
          const review = reviews.find((r) => r.id === violation.reviewId);
          const item = review ? items.find((i) => i.id === review.itemId) : null;
          const shop = review
            ? shops.find((s) => s.items.some((i) => i.id === review.itemId))
            : null;

          return (
            <div key={violation.id} className="w-full flex flex-col items-center">
              <CardDisplay
                title={`Reported for: ${violation.reason}`}
                subtitle={`Reported by: ${violation.reportedBy}`}
                status={violation.status}
                highlightColor="bg-white"
                disableActions
                content={
                  review ? (
                    <div className="p-5 bg-gray-100 rounded-xl mt-4 flex flex-col items-center text-center">
                      <p className="font-semibold text-gray-800">
                        {shop?.name || "Unknown Shop"}
                      </p>
                      <p className="text-gray-500 text-sm mb-2">
                        {item?.name || "Unknown Item"}
                      </p>
                      <p className="text-gray-700 italic mb-3">
                        “{review.comment}”
                      </p>
                      <p className="text-gray-600">⭐ {review.rating}/5</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic mt-2">
                      Review content unavailable.
                    </p>
                  )
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeeViolations;
