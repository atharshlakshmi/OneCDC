import React, { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

interface ModerationLog {
  _id: string;
  action: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  targetUser?: {
    _id: string;
    name: string;
    email: string;
  };
  targetReview?: string;
  targetShop?: {
    _id: string;
    name: string;
  };
  reason: string;
  timestamp: string;
}

const ModerationLogs: React.FC = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/admin/logs");
      setLogs(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch moderation logs");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const actionUpper = action.toUpperCase();
    if (actionUpper.includes("REMOVE") || actionUpper.includes("DELETE")) {
      return "text-red-600 bg-red-50";
    }
    if (actionUpper.includes("WARN")) {
      return "text-orange-600 bg-orange-50";
    }
    if (actionUpper.includes("APPROVE")) {
      return "text-green-600 bg-green-50";
    }
    return "text-blue-600 bg-blue-50";
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading moderation logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">No moderation logs found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Audit Trail:</span> All moderation actions
          are logged here for transparency and accountability.
        </p>
      </div>

      {logs.map((log) => (
        <div
          key={log._id}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          {/* Log Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-lg text-sm font-semibold ${getActionColor(
                  log.action
                )}`}
              >
                {formatAction(log.action)}
              </span>
              <div>
                <p className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">ID: {log._id.slice(-8)}</p>
          </div>

          {/* Moderator Info */}
          <div className="mb-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Performed by:</span>{" "}
              {log.performedBy.name} ({log.performedBy.email})
            </p>
          </div>

          {/* Target Info */}
          {log.targetUser && (
            <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Target User:</span>{" "}
                {log.targetUser.name} ({log.targetUser.email})
              </p>
            </div>
          )}

          {log.targetShop && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Target Shop:</span>{" "}
                {log.targetShop.name}
              </p>
            </div>
          )}

          {log.targetReview && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Target Review ID:</span>{" "}
                {log.targetReview}
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Reason:</span> {log.reason}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModerationLogs;
