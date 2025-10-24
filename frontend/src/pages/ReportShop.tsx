import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { shops } from "../data/mockData"; 
import CardDisplay from "@/components/CardDisplay";

const ReportShop: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive IDs from navigation (e.g. navigate("/ReportShop", { state: { shopId, reporterId } }))
  const { shopId, reporterId } = location.state || {};

  // Find the full shop data
  const shop = shops.find((s) => s.id === shopId);

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      shopId,
      reporterId,
      reason,
      details,
    });

    navigate("/ActionSuccess", {
      state: {
        message: "Your report has been submitted successfully.",
        backPath: `/ViewShop/${shopId}`,
      },
    });
  };

  if (!shop) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Shop not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Report Shop" />

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white shadow-md rounded-2xl p-6 mt-6 space-y-6"
      >
        {/* --- Shop Summary --- */}
        <div className="flex flex-col items-center">
          <CardDisplay
            key={shop.id}
            title={shop.name}
            content={shop.details}
            details={`Address: ${shop.address}`}
          />
        </div>

        {/* --- Reason for Reporting --- */}
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
              <option value="inappropriate">Inappropriate or Offensive Content</option>
              <option value="misleading">False or Misleading Information</option>
              <option value="spam">Spam or Advertisement</option>
              <option value="fake">Fake Shop or Impersonation</option>
              <option value="other">Other</option>
            </select>

            {/* Down arrow icon */}
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
            placeholder="Please provide more details if necessary..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>

        {/* --- Submit --- */}
        <Button
          type="submit"
          className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
        >
          Submit Report
        </Button>

        <p className="text-sm text-gray-500 text-center">
          Reports are reviewed by our moderation team.
        </p>
      </form>
    </div>
  );
};

export default ReportShop;
