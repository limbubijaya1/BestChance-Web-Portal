import React, { useState, useEffect } from "react";
import OrderSidebar from "../../../components/Order/OrderSidebar";
import TopNav from "../../../components/TopNav";
import CombinedOrder from "../../../components/Order/CombinedOrder/CombinedOrderFleet";
import { useParams } from "react-router-dom";

const CombinedOrderFleetPage = () => {
  const { projectID } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1025) {
        setIsSidebarOpen(true); // Show sidebar on larger screens (≥1025px)
      } else {
        setIsSidebarOpen(false); // Hide sidebar on smaller screens (<1025px)
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      <OrderSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1">
        <TopNav onToggleSidebar={toggleSidebar} />
        <main className="p-5">
          <CombinedOrder />
        </main>
      </div>
    </div>
  );
};

export default CombinedOrderFleetPage;
