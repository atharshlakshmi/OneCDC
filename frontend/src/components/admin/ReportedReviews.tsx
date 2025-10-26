import React, { useState, useEffect } from "react";
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
    reviewer: {
      name: string;
      email: string;
    };
    itemName: string;
    shopName: string;
  };
}

const ReportedReviews: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleModerate = async (reportId: string, action: "approve" | "remove") => {
    const reason = prompt(
      `Please enter a reason for ${action === "approve" ? "approving" : "removing"} this review:`
    );

    if (!reason) {
      toast.error("Reason is required");
      return;
    }

    try {
      setActionLoading(reportId);
      await apiPost(`/admin/moderate/review/${reportId}`, { action, reason });
      toast.success(
        `Review ${action === "approve" ? "approved" : "removed"} successfully`
      );
      fetchReports(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to moderate review");
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
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Report ID: {report._id.slice(-8)}
              </h3>
              <p className="text-sm text-gray-500">
                Status:{" "}
                <span
                  className={`font-medium ${
                    report.status === "PENDING"
                      ? "text-yellow-600"
                      : report.status === "RESOLVED"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {report.status}
                </span>
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Reporter Info */}
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Reported by:</span>{" "}
              {report.reporter.name} ({report.reporter.email})
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Category:</span>{" "}
              {report.reportCategory}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Reason:</span> {report.description}
            </p>
          </div>

          {/* Review Details */}
          {report.reviewDetails && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {report.reviewDetails.shopName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {report.reviewDetails.itemName}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  ⭐ {report.reviewDetails.rating}/5
                </p>
              </div>
              <p className="text-gray-700 italic mb-2">
                "{report.reviewDetails.comment}"
              </p>
              <p className="text-xs text-gray-500">
                By: {report.reviewDetails.reviewer.name} (
                {report.reviewDetails.reviewer.email})
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {report.status === "PENDING" && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => handleModerate(report._id, "approve")}
                disabled={actionLoading === report._id}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {actionLoading === report._id ? "Processing..." : "Approve Report"}
              </Button>
              <Button
                onClick={() => handleModerate(report._id, "remove")}
                disabled={actionLoading === report._id}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                {actionLoading === report._id
                  ? "Processing..."
                  : "Remove Review"}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportedReviews;
