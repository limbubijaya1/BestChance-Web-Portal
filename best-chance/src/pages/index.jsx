import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import AllProject from "../components/AllProject";
import sidebarImage from "../Assets/Image/sidebar.png";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Adjust breakpoint as needed
        setIsSidebarOpen(false); // Hide sidebar on small screens
      } else {
        setIsSidebarOpen(true); // Show sidebar on larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once on mount to set initial state

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="flex">
      {/* Toggle Button for Small Screens */}
      <button
        className="md:hidden p-2 text-white rounded fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <img src={sidebarImage} alt="sidebar button" className="w-6 h-6" />
      </button>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        } transition-margin duration-300`}
      >
        <TopNav />
        <div className="p-5">
          <AllProject />
        </div>
      </div>
    </div>
  );
};

export default Index;
