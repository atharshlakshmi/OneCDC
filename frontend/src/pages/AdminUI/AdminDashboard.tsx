import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportedReviews from "@/components/admin/ReportedReviews";
import ReportedShops from "@/components/admin/ReportedShops";
import UserManagement from "@/components/admin/UserManagement";
import ModerationLogs from "@/components/admin/ModerationLogs";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("reviews");

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="Admin Dashboard" to="/" />

      <div className="px-4 sm:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
            <TabsTrigger value="reviews">Reported Reviews</TabsTrigger>
            <TabsTrigger value="shops">Reported Shops</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logs">Moderation Logs</TabsTrigger>
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
