import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import CardDisplay from "@/components/CardDisplay";
import { reviews, items, shops, users } from "../data/mockData";

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
      <div className="flex flex-col gap-5 items-center m-5 justify-center">
        {userReports.map((report) => {
          const reportedReview = reviews.find((r) => r.id === report.reviewId);
          const reportedShop = shops.find((s) => s.id === report.shopId);
          const item = items.find((i) => i.id === reportedReview?.itemId);
          const title = reportedReview
            ? `Report on ${item?.name}`
            : `Report on ${reportedShop?.name}`;
          const content = reportedReview
            ? reportedReview.comment
            : reportedShop?.details;

          return (
            <CardDisplay
              key={report.id}
              title={title}
              subtitle={report.reason}
              content={content}
              details={report.details}
              status={report.status}
              date={report.date}
              onEdit={() => handleEditReport(report.id)}
              onDelete={() => handleDelete(report.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SeeReports;
