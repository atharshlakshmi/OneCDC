import React from "react";
import PageHeader from "@/components/PageHeader";
import CardDisplay from "@/components/CardDisplay";
import { shops, reviews, users, items } from "../../data/mockData";

const SeeViolations: React.FC = () => {
  const currentUser = users.find((u) => u.id === 2); 

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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Reports Against Me" />

      {/* Confirmed count */}
      <div className="text-center text-gray-600 text-sm font-semibold mt-2">
        Confirmed Violations:{" "}
        <span className="font-medium">{confirmedCount}</span>
      </div>

      {/* Violations List */}
      <div className="flex flex-col gap-6 items-center m-5 justify-center">
        {violations.map((violation) => {
          const review = reviews.find((r) => r.id === violation.reviewId);
          const item = review ? items.find((i) => i.id === review.itemId) : null;
          const shop = review
            ? shops.find((s) => s.items.some((i) => i.id === review.itemId))
            : null;

          return (
            <div
              key={violation.id}
              className="w-full sm:w-3/4 bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4 border border-gray-200"
            >
              {/* Outer Card Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Reported for: {violation.reason}
                </h2>

                <span
                  className={`text-sm font-medium mt-1 sm:mt-0 ${
                    violation.status === "Resolved"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {violation.status}
                </span>
              </div>

              <div className="flex flex-col gap-3 align-center justify-center items-center">
                <CardDisplay
                  key={`inner-${violation.id}`}
                  title={shop?.name || "Unknown Shop"}
                  subtitle={item ? `Item: ${item.name}` : ""}
                  content={
                    review ? (
                      <div className="text-center text-gray-700 italic">
                        “{review.comment}”
                      </div>
                    ) : (
                      "Review content unavailable."
                    )
                  }
                  disableActions
                  highlightColor="bg-gray-100"
                />
              </div>

              
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeeViolations;
