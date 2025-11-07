import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface Review {
  id: string;
  itemId: string;
  shopperName: string;
  description: string;
  availability: boolean;
  images?: string[];
}

const ReportReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive IDs from navigation
  const { reviewId } = location.state || {};

  const [review, setReview] = useState<Review | null>(null);
  const [itemName, setItemName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  // Fetch review data
  useEffect(() => {
    const fetchReview = async () => {
      if (!reviewId) return;

      setLoading(true);
      try {
        // We need to find the review by searching through items' reviews
        // This is a workaround since we don't have a direct /reviews/:id endpoint
        // We'll use the itemId from the location state if available
        const itemId = location.state?.itemId;

        if (itemId) {
          const reviews = await apiGet<Review[]>(`/items/${itemId}/reviews`);
          const foundReview = reviews.find((r) => r.id === reviewId);

          if (foundReview) {
            setReview(foundReview);
            // Fetch item name
            const item = await apiGet<any>(`/items/${itemId}`);
            setItemName(item.name);
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch review:", error);
        toast.error("Failed to load review details");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [reviewId, location.state?.itemId]);

  // Map frontend reason values to backend category values
  const mapReasonToCategory = (reason: string): string => {
    const mapping: { [key: string]: string } = {
      inappropriate: "offensive",
      spam: "spam",
      false: "false_information",
      harassment: "offensive",
      other: "offensive",
    };
    return mapping[reason] || "offensive";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewId) {
      toast.error("Review ID is missing");
      return;
    }

    setSubmitting(true);

    try {
      await apiPost("/reports/review", {
        reviewId,
        category: mapReasonToCategory(reason),
        description: details || `Report reason: ${reason}`,
      });

      toast.success("Your report has been submitted successfully!");
      setTimeout(() => {
        navigate(`/ViewItem/${review?.itemId}`);
      }, 500);
    } catch (error: any) {
      console.error("Failed to submit report:", error);
      toast.error(error.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-3 text-gray-600">Loading review...</span>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg">
        Review not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Report Review" />

      <div className="flex flex-col gap-5 items-center m-5 justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl rounded-2xl bg-white shadow-lg p-8 sm:p-10 space-y-6"
        >
          {/* --- Review Summary --- */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Information</h3>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="mb-4">
                <img
                  src={review.images[0]}
                  alt="Review"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {review.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {review.images.slice(1, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review image ${idx + 2}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Item Name</p>
                <p className="text-lg font-semibold text-gray-900">{itemName || "Unknown Item"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Review Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    review.availability
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {review.availability ? "Available" : "Not Available"}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Review Description</p>
                <p className="text-gray-700">{review.description}</p>
              </div>
            </div>
          </div>

          {/* --- Reason for Reporting --- */}
          <div className="space-y-3">
            <label className="block text-gray-700 font-semibold text-lg">
              Reason for Reporting <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500">
              Please select the primary reason for reporting this review
            </p>

            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full appearance-none border-2 border-gray-200 rounded-xl bg-white py-4 px-5 pr-12 text-gray-800 font-medium focus:border-gray-300 outline-none transition-all hover:border-gray-300 cursor-pointer"
              >
                <option value="" disabled>Select a reason</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="spam">Spam or Advertisement</option>
                <option value="false">False or Misleading Information</option>
                <option value="harassment">Harassment or Hate Speech</option>
                <option value="other">Other</option>
              </select>

              {/* Down arrow icon */}
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none"
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
          <div className="space-y-3">
            <label className="block text-gray-700 font-semibold text-lg">
              Additional Details <span className="text-gray-400 text-sm font-normal">(Optional)</span>
            </label>
            <p className="text-sm text-gray-500">
              Provide any additional context that will help our moderation team
            </p>
            <textarea
              className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 resize-none focus:border-gray-300 outline-none transition-all hover:border-gray-300"
              placeholder="Describe the issue in detail..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-gray-400 text-right">
              {details.length}/1000 characters
            </p>
          </div>

          {/* --- Submit --- */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting Report...
                </span>
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center pt-2">
            Reports are reviewed by our moderation team within 24-48 hours
          </p>
        </form>
      </div>
    </div>
  );
};

export default ReportReview;
