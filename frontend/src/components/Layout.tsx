import React, { useEffect, useRef, useState } from "react";
import Footer from "./Footer";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const updateFooterHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    updateFooterHeight(); // initial measurement
    window.addEventListener("resize", updateFooterHeight);

    return () => window.removeEventListener("resize", updateFooterHeight);
  }, []);

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: footerHeight+15}}>
=======
    <div className="min-h-screen bg-gray-50" style={{ paddingBottom: footerHeight+100}}>
>>>>>>> origin/lakshmi
      {children}

      <div ref={footerRef}>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
