import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShopReport {
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
  shopDetails?: {
    _id: string;
    name: string;
    description: string;
    address: string;
    category: string;
    phone: string;
    email: string;
    owner: {
      name: string;
      email: string;
    };
    reportCount: number;
    warnings: number;
  };
}

const ReportedShops: React.FC = () => {
  const [reports, setReports] = useState<ShopReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/admin/reports/shops");
      setReports(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch reported shops");
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reportId: string, action: "approve" | "warn") => {
    const reason = prompt(
      `Please enter a reason for ${action === "approve" ? "dismissing" : "warning"} this shop:`
    );

    if (!reason) {
      toast.error("Reason is required");
      return;
    }

    try {
      setActionLoading(reportId);
      await apiPost(`/admin/moderate/shop/${reportId}`, { action, reason });
      toast.success(
        `Shop ${action === "approve" ? "report dismissed" : "warned"} successfully`
      );
      fetchReports(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to moderate shop");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading reported shops...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">No reported shops to moderate</p>
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

          {/* Shop Details */}
          {report.shopDetails && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xl font-semibold text-gray-800">
                    {report.shopDetails.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {report.shopDetails.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-600 font-medium">
                    Reports: {report.shopDetails.reportCount}
                  </p>
                  <p className="text-xs text-orange-600 font-medium">
                    Warnings: {report.shopDetails.warnings}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-2">{report.shopDetails.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Address:</span>{" "}
                  {report.shopDetails.address}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Phone:</span>{" "}
                  {report.shopDetails.phone}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Email:</span>{" "}
                  {report.shopDetails.email}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Owner:</span>{" "}
                  {report.shopDetails.owner.name}
                </p>
              </div>
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
                {actionLoading === report._id ? "Processing..." : "Dismiss Report"}
              </Button>
              <Button
                onClick={() => handleModerate(report._id, "warn")}
                disabled={actionLoading === report._id}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                {actionLoading === report._id
                  ? "Processing..."
                  : "Warn Shop Owner"}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReportedShops;
