import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Report {
  _id: string;
  reportedItem: string;
  reporter: {
    _id: string;
    name: string;
    email: string;
  };
  reportCategory: string;
  description: string;
  status: string;
  createdAt: string;
  reviewDetails?: {
    _id: string;
    rating: number;
    comment: string;
    availability: boolean;
    reviewer: {
      name: string;
      email: string;
    };
    itemName: string;
    shopName: string;
    images?: string[];
    photos?: string[];
  };
}

const ReportedReviews: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Helper function to convert category to readable text
  const getCategoryText = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      spam: "Spam",
      offensive: "Offensive",
      misleading: "Misleading",
      false_information: "False Information",
    };
    return categoryMap[category] || category;
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/admin/reports/reviews");
      setReports(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch reported reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveReview = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      await apiPost(`/admin/moderate/review/${reportId}`, { action: "remove" });
      toast.success("Review removed successfully");
      fetchReports(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to remove review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      await apiPost(`/admin/moderate/review/${reportId}`, { action: "approve" });
      toast.success("Report resolved successfully");
      fetchReports(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve report");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading reported reviews...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">No reported reviews to moderate</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reports.map((report) => (
        <div
          key={report._id}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          {/* Report Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Report ID: {report._id}
            </h3>
            <p className="text-xs text-gray-400">
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Reporter Info */}
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Reported by:</span>{" "}
              {report.reporter.name} ({report.reporter.email})
            </p>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Category:</span>{" "}
              {report.reportCategory ? report.reportCategory.toUpperCase().replace(/_/g, ' ') : '-'}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Reason:</span> {report.description || "-"}
            </p>
          </div>

          {/* Review Details */}
          {report.reviewDetails ? (
            <Link
              to={`/ViewItem/${report.reviewDetails.itemName}`}
              className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer block"
            >
              <h4 className="font-semibold text-gray-800 mb-3">Reported Review:</h4>
              <div className="flex gap-4">
                {/* Left side - Content */}
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Reviewer:</span> {report.reviewDetails.reviewer.name} ({report.reviewDetails.reviewer.email})
                  </p>
                  <p className="text-gray-700 italic mb-3">
                    "{report.reviewDetails.comment}"
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Availability:</span>{" "}
                    <span className={`font-medium ${report.reviewDetails.availability ? "text-green-600" : "text-red-600"}`}>
                      {report.reviewDetails.availability ? "Available" : "Not Available"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Item:</span> {report.reviewDetails.itemName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Shop:</span> {report.reviewDetails.shopName}
                  </p>
                </div>

                {/* Right side - Images */}
                {(report.reviewDetails.images?.length > 0 || report.reviewDetails.photos?.length > 0) && (
                  <div className="w-1/3 flex flex-col gap-2">
                    {(report.reviewDetails.images || report.reviewDetails.photos)?.map((imageUrl, index) => (
                      <div key={index} className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Reported Review:</h4>
              <p className="text-sm text-yellow-700">
                ⚠️ The reported review is no longer available. It may have been deleted or removed from the catalogue.
              </p>
            </div>
          )}

          {/* Status and Action Buttons */}
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span
                className={`font-medium ${
                  report.status === "PENDING" || report.status === "pending"
                    ? "text-yellow-600"
                    : report.status === "RESOLVED" || report.status === "resolved"
                    ? "text-green-600"
                    : report.status === "REVIEW_REMOVED" || report.status === "review_removed"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {report.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </p>

            {/* Action Buttons */}
            {(report.status === "PENDING" || report.status === "pending") && (
              <div className="flex gap-3">
                <Button
                  onClick={() => handleRemoveReview(report._id)}
                  disabled={actionLoading === report._id}
                  className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  size="sm"
                >
                  {actionLoading === report._id ? "Processing..." : "Remove Review"}
                </Button>
                <Button
                  onClick={() => handleResolveReport(report._id)}
                  disabled={actionLoading === report._id}
                  className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
                  size="sm"
                >
                  {actionLoading === report._id ? "Processing..." : "Resolve Report"}
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportedReviews;
