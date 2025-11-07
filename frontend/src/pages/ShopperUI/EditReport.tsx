import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { reviews, items, shops } from "../../data/mockData";
import CardDisplay from "@/components/CardDisplay";
import { toast } from "sonner";

const EditReport: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reportId, userId } = location.state || {};

  // --- Sample mock reports (in a real app this comes from backend or global state)
  const reports = [
    {
      id: 1,
      reporterId: 1,
      reviewId: 2,
      reason: "False or misleading content",
      details: "The review seems fake.",
      status: "Pending",
      date: "2025-10-22",
    },
    {
      id: 2,
      reporterId: 1,
      shopId: 3,
      reason: "Inaccurate information",
      details: "Wrong address listed.",
      status: "Resolved",
      date: "2025-09-15",
    },
  ];

  const report = reports.find((r) => r.id === reportId);

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Report not found.
      </div>
    );
  }

  // --- Determine if it's a shop or item report ---
  const isShopReport = !!report.shopId;

  const reportedShop = shops.find((s) => s.id === report.shopId);
  const reportedReview = reviews.find((r) => r.id === report.reviewId);
  const item = items.find((i) => i.id === reportedReview?.itemId);

  const [reason, setReason] = useState(report.reason);
  const [details, setDetails] = useState(report.details);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      reportId,
      userId,
      updatedReason: reason,
      updatedDetails: details,
      reportType: isShopReport ? "Shop" : "Item Review",
    });

    // Show success toast and navigate back
    toast.success("Your report has been updated successfully!");
    setTimeout(() => {
      navigate(isShopReport ? `/ViewShop/${reportedShop?.id}` : `/ViewItem/${item?.id}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title={`Edit ${isShopReport ? "Shop" : "Item"} Report`} />

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-6 space-y-6"
      >
        {/* --- Card Display (Shop or Review) --- */}
        <div className="flex flex-col items-center">
          {isShopReport ? (
            <CardDisplay
              key={reportedShop?.id}
              title={reportedShop?.name || "Unknown Shop"}
              content={reportedShop?.details}
              details={`Address: ${reportedShop?.address || "N/A"}`}
              disableActions
            />
          ) : (
            <CardDisplay
              key={reportedReview?.id}
              title={item?.name || "Unknown Item"}
              rating={reportedReview?.rating}
              content={reportedReview?.comment}
              disableActions
            />
          )}
        </div>

        {/* --- Reason --- */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Reason for Reporting <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full appearance-none border border-gray-300 rounded-lg bg-gray-50 py-3 px-4 pr-10 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select a reason</option>
              {isShopReport ? (
                <>
                  <option value="inappropriate">Inappropriate or Offensive Content</option>
                  <option value="misleading">False or Misleading Information</option>
                  <option value="spam">Spam or Advertisement</option>
                  <option value="fake">Fake Shop or Impersonation</option>
                  <option value="other">Other</option>
                </>
              ) : (
                <>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="spam">Spam or Advertisement</option>
                  <option value="false">False or Misleading Information</option>
                  <option value="harassment">Harassment or Hate Speech</option>
                  <option value="other">Other</option>
                </>
              )}
            </select>

            {/* Dropdown Icon */}
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* --- Additional Details --- */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Additional Details (Optional)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Provide more details if necessary..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        {/* --- Submit --- */}
        <Button
          type="submit"
          className="w-full bg-blue-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition"
        >
          Save Changes
        </Button>

        <p className="text-sm text-gray-500 text-center">
          Reports can only be edited before being reviewed by moderators.
        </p>
      </form>
    </div>
  );
};

export default EditReport;
