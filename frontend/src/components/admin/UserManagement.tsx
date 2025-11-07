import React, { useState, useEffect } from "react";
import { apiGet, apiDelete } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Warning {
  reason: string;
  issuedAt: Date;
  issuedBy: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  warnings: Warning[];
  isActive: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiGet("/admin/users");
      setUsers(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove user "${userName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const reason = prompt("Please enter a reason for removing this user:");

    if (!reason) {
      toast.error("Reason is required");
      return;
    }

    try {
      setActionLoading(userId);
      await apiDelete(`/admin/users/${userId}`, { reason });
      toast.success(`User "${userName}" removed successfully`);
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to remove user");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500">No users with warnings found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> Users with 3 or more warnings
          should be reviewed for removal.
        </p>
      </div>

      {users.map((user) => (
        <div
          key={user._id}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          {/* User Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {user.role.toUpperCase()}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-2xl font-bold ${
                  user.warnings.length >= 3
                    ? "text-red-600"
                    : user.warnings.length >= 2
                    ? "text-orange-600"
                    : "text-yellow-600"
                }`}
              >
                {user.warnings.length}
              </p>
              <p className="text-xs text-gray-500">Warnings</p>
            </div>
          </div>

          {/* Warnings List */}
          {user.warnings.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Warning History:
              </p>
              <div className="space-y-2">
                {user.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Reason:</span> {warning.reason}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Issued on {new Date(warning.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="text-xs text-gray-500 mb-4">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </div>

          {/* Action Buttons */}
          {user.isActive && (
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => handleRemoveUser(user._id, user.name)}
                disabled={actionLoading === user._id}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                {actionLoading === user._id ? "Removing..." : "Remove User"}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserManagement;
