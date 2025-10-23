import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title?: string;   // optional title
  to?: string;      // optional custom back path
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
    <div className="relative flex items-center justify-center m-5 h-10">
      <div className="absolute left-1">
        <Button variant="outline" size = "sm" onClick={handleBack}>
          <ArrowLeft />
        </Button>
      </div>
      {title && <p className="text-2xl font-semibold">{title}</p>}
    </div>
  );
};

export default PageHeader;
