import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    images?: string[];
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

  const handleRemoveShop = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      await apiPost(`/admin/moderate/shop/${reportId}`, { action: "remove" });
      toast.success("Shop removed successfully");
      fetchReports(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to remove shop");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      setActionLoading(reportId);
      await apiPost(`/admin/moderate/shop/${reportId}`, { action: "approve" });
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

          {/* Shop Details */}
          {report.shopDetails ? (
            <Link
              to={`/ViewShop/${report.shopDetails._id}`}
              className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer block"
            >
              <h4 className="font-semibold text-gray-800 mb-3">Reported Shop:</h4>
              <div className="flex gap-4">
                {/* Left side - Content */}
                <div className="flex-1">
                  <p className="text-xl font-semibold text-gray-800 mb-2">
                    {report.shopDetails.name || 'Unknown Shop'}
                  </p>
                  <p className="text-gray-700 mb-3">
                    {report.shopDetails.description || '-'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Category:</span> {report.shopDetails.category || '-'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Address:</span> {report.shopDetails.address || '-'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Phone:</span> {report.shopDetails.phone || '-'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Email:</span> {report.shopDetails.email || '-'}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Owner:</span> {report.shopDetails.owner ? `${report.shopDetails.owner.name} (${report.shopDetails.owner.email})` : '-'}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <p className="text-sm text-red-600 font-medium">
                      Reports: {report.shopDetails.reportCount || 0}
                    </p>
                    <p className="text-sm text-orange-600 font-medium">
                      Warnings: {report.shopDetails.warnings || 0}
                    </p>
                  </div>
                </div>

                {/* Right side - Images */}
                {report.shopDetails.images && report.shopDetails.images.length > 0 && (
                  <div className="w-1/3 flex flex-col gap-2">
                    {report.shopDetails.images.map((imageUrl, index) => (
                      <div key={index} className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={`Shop image ${index + 1}`}
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
              <h4 className="font-semibold text-yellow-800 mb-2">Reported Shop:</h4>
              <p className="text-sm text-yellow-700">
                ⚠️ The reported shop is no longer available. It may have been deleted or removed.
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
                    : report.status === "SHOP_REMOVED" || report.status === "shop_removed"
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
                  onClick={() => handleRemoveShop(report._id)}
                  disabled={actionLoading === report._id}
                  className="bg-red-500 hover:bg-red-600 text-white shadow-lg"
                  size="sm"
                >
                  {actionLoading === report._id ? "Processing..." : "Remove Shop"}
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

export default ReportedShops;
