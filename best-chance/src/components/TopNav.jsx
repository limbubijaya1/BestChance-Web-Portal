import React from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import sidebarImage from "../Assets/Image/sidebar.png";

const TopNav = ({ onToggleSidebar }) => {
  const storedUsername = localStorage.getItem("username");

  return (
    <div className="flex items-center justify-between bg-white border-b border-b-gray-100 p-4 h-20 lg:justify-end">
      {/* Sidebar Toggle Button - shown only on screens <1025px */}
      <button className="lg:hidden p-2 rounded-md" onClick={onToggleSidebar}>
        <img src={sidebarImage} alt="Menu" className="w-6 h-6" />
      </button>
      {/* User Profile Section */}
      <div className="flex items-center">
        <IoPersonCircleOutline className="w-8 h-8 text-gray-600" />
        <span className="ml-2">{storedUsername || "Guest"}</span>
      </div>
    </div>
  );
};

export default TopNav;
