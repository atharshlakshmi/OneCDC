import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportedReviews from "@/components/admin/ReportedReviews";
import ReportedShops from "@/components/admin/ReportedShops";
import UserManagement from "@/components/admin/UserManagement";
import ModerationLogs from "@/components/admin/ModerationLogs";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="flex items-center justify-center m-5 h-10">
        <p className="text-2xl font-semibold">Admin Dashboard</p>
      </div>

      <div className="px-4 sm:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex justify-center gap-4 mb-6 bg-transparent">
            <TabsTrigger value="reviews" className="bg-amber-400 text-white hover:bg-amber-500 shadow-lg px-6">Reported Reviews</TabsTrigger>
            <TabsTrigger value="shops" className="bg-amber-400 text-white hover:bg-amber-500 shadow-lg px-6">Reported Shops</TabsTrigger>
            <TabsTrigger value="users" className="bg-amber-400 text-white hover:bg-amber-500 shadow-lg px-6">Users</TabsTrigger>
            <TabsTrigger value="logs" className="bg-amber-400 text-white hover:bg-amber-500 shadow-lg px-6">Moderation Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <ReportedReviews />
          </TabsContent>

          <TabsContent value="shops">
            <ReportedShops />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="logs">
            <ModerationLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
