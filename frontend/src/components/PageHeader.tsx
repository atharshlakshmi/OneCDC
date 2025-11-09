import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title?: string; // optional title
  to?: string; // optional custom back path
}

const PageHeader: React.FC<PageHeaderProps> = ({ title = "", to }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="relative flex items-center m-5 min-h-10">
      <div className="flex-shrink-0">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft />
        </Button>
      </div>
      {title && <p className="text-xl sm:text-2xl font-semibold flex-1 text-center px-4 overflow-hidden text-ellipsis whitespace-nowrap">{title}</p>}
      <div className="flex-shrink-0 w-10"></div> {/* Spacer for balance */}
    </div>
  );
};

export default PageHeader;
