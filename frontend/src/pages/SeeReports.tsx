import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import CardDisplay from "@/components/CardDisplay";
import { reviews, items, shops, users } from "../data/mockData";
import { Button } from "@/components/ui/button";

const SeeReports: React.FC = () => {
  const currentUser = users.find((u) => u.id === 1);
  const navigate = useNavigate();

  const reports = [
    {
      id: 1,
      reporterId: 1,
      reviewId: 2,
      reason: "False or misleading content",
      details: "The review seems fake.",
      status: "Pending",
      date: "2025-10-22",
    },
    {
      id: 2,
      reporterId: 1,
      shopId: 3,
      reason: "Inaccurate information",
      details: "Wrong address listed.",
      status: "Resolved",
      date: "2025-09-15",
    },
  ];

  const userReports = reports.filter((r) => r.reporterId === currentUser?.id);

  const handleEditReport = (reportId: number) => {
    navigate("/EditReport", { state: { reportId, userId: currentUser?.id } });
  };

  const handleDelete = (id: number) =>
    confirm("Are you sure you want to delete this report?") && alert(`Deleted report #${id}`);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PageHeader title="My Reports" />
      <div className="flex flex-col gap-6 items-center m-5 justify-center">
        {userReports.map((report) => {
          const reportedReview = reviews.find((r) => r.id === report.reviewId);
          const reportedShop = shops.find((s) => s.id === report.shopId);

          // If it's an item review report, find item + its shop correctly
          const item = items.find((i) => i.id === reportedReview?.itemId);
          const itemShop = shops.find((s) => s.id === item?.shopId);

          const isItemReport = Boolean(reportedReview);

          const title = isItemReport
            ? `Report on ${item?.name || "Unknown Item"} from ${itemShop?.name || "Unknown Shop"}`
            : `Report on ${reportedShop?.name || "Unknown Shop"}`;

          const content = isItemReport
            ? reportedReview?.comment
            : reportedShop?.details;

          return (
            <div
              key={report.id}
              className="w-full sm:w-3/4 bg-white shadow-lg rounded-2xl p-6 flex flex-col gap-4 border border-gray-200"
            >
              
              {/* Outer Card Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                
                <span
                  className={`text-sm font-medium mt-1 sm:mt-0 ${
                    report.status === "Resolved"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {report.status}
                </span>
              </div>
              <div className = "flex flex-col gap-3 align-center justify-center items-center">
                <CardDisplay
                  key={`inner-${report.id}`}
                  title={isItemReport ? item?.name || "Unknown Item" : reportedShop?.name}
                  subtitle={isItemReport ? `Shop: ${itemShop?.name}` : ""}
                  content={content}
                  disableActions
                  highlightColor = "bg-gray-100"
                />
              </div>

              <p className="text-gray-700 text-base font-medium">
                Reason: <span className="font-normal">{report.reason}</span>
              </p>

              <p className="text-gray-600 text-sm italic">{report.details}</p>

              <p className="text-gray-400 text-xs">Date: {report.date}</p>

              {/* Nested Inner Card */}
              
                

              {/* Action Buttons (only if unresolved) */}
              {report.status !== "Resolved" && (
                <div className="flex gap-3 justify-end mt-3">
                  <div className="flex gap-3 mt-2">
                    <Button variant="outline" onClick={() => handleEditReport(report.id)}>
                      Edit
                    </Button>


                    <Button variant="destructive" onClick={() => handleDelete(report.id)}>
                      Delete
                    </Button>

                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeeReports;

