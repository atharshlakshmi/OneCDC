import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useImageBlobUrls, getImageDisplayUrl } from "../../utils/imageUtils";

interface Shop {
  id: string;
  name: string;
  details: string;
  address: string;
  images?: string[];
}

const ReportShop: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive IDs from navigation
  const { shopId } = location.state || {};

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  // Convert shop images to blob URLs for better performance
  const imageBlobUrls = useImageBlobUrls(shop?.images || []);

  // Fetch shop data
  useEffect(() => {
    const fetchShop = async () => {
      if (!shopId) return;

      setLoading(true);
      try {
        const response = await apiGet<Shop>(`/shops/${shopId}`);
        setShop(response);
      } catch (error: any) {
        console.error("Failed to fetch shop:", error);
        toast.error("Failed to load shop details");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  // Map frontend reason values to backend category values
  const mapReasonToCategory = (reason: string): string => {
    const mapping: { [key: string]: string } = {
      inappropriate: "offensive",
      misleading: "misleading",
      spam: "spam",
      fake: "false_information",
      other: "offensive",
    };
    return mapping[reason] || "offensive";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopId) {
      toast.error("Shop ID is missing");
      return;
    }

    setSubmitting(true);

    try {
      await apiPost("/reports/shop", {
        shopId,
        category: mapReasonToCategory(reason),
        description: details || `Report reason: ${reason}`,
      });

      toast.success("Your report has been submitted successfully!");
      setTimeout(() => {
        navigate(`/ViewShop/${shopId}`);
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
        <span className="ml-3 text-gray-600">Loading shop...</span>
      </div>
    );
  }

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

      <div className="flex flex-col gap-5 items-center m-5 justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl rounded-2xl bg-white shadow-lg p-8 sm:p-10 space-y-6"
        >
          {/* --- Shop Summary --- */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Shop Information</h3>

            {/* Shop Image */}
            {shop.images && shop.images.length > 0 && (
              <div className="mb-4">
                <img
                  src={getImageDisplayUrl(shop.images[0], imageBlobUrls)}
                  alt={shop.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Shop Name</p>
                <p className="text-lg font-semibold text-gray-900">{shop.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{shop.details}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="text-gray-700">{shop.address}</p>
              </div>
            </div>
          </div>

          {/* --- Reason for Reporting --- */}
          <div className="space-y-3">
            <label className="block text-gray-700 font-semibold text-lg">
              Reason for Reporting <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500">
              Please select the primary reason for reporting this shop
            </p>

            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full appearance-none border-2 border-gray-200 rounded-xl bg-white py-4 px-5 pr-12 text-gray-800 font-medium focus:border-gray-300 outline-none transition-all hover:border-gray-300 cursor-pointer"
              >
                <option value="" disabled>Select a reason</option>
                <option value="inappropriate">Inappropriate or Offensive Content</option>
                <option value="misleading">False or Misleading Information</option>
                <option value="spam">Spam or Advertisement</option>
                <option value="fake">Fake Shop or Impersonation</option>
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

export default ReportShop;
