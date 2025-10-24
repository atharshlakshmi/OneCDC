import React from "react";
import PageHeader from "@/components/PageHeader";

const SeeViolations: React.FC = () => {
  // Mock data
  const violations = [
    { id: 1, reportedBy: "Jane Doe", reason: "Spam content", status: "Resolved" },
    { id: 2, reportedBy: "Tom", reason: "Misleading information", status: "Pending" },
  ];

  return (
    <div>
      <PageHeader title="Reports Against Me" />
      <div className="flex flex-col gap-5 items-center m-5 justify-center">
        {violations.map((violation) => (
          <div
            key={violation.id}
            className="w-full sm:w-3/4 rounded-2xl bg-white shadow-lg p-8 sm:p-10 flex flex-col gap-3 items-center text-center"
          >
            <h2 className="text-lg font-semibold">Reported by: {violation.reportedBy}</h2>
            <p className="text-gray-700">{violation.reason}</p>
            <p
              className={`font-medium ${
                violation.status === "Resolved" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              Status: {violation.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeeViolations;
