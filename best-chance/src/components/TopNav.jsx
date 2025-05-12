import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoPersonCircleOutline } from "react-icons/io5";
import sidebarImage from "../Assets/Image/sidebar.png";
import Cookies from "js-cookie";

const TopNav = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const storedUsername = localStorage.getItem("username");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!storedUsername) {
      Cookies.remove("access_token");
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate, storedUsername]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove("access_token");
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between bg-white border-b border-gray-300 p-4 h-20 lg:justify-end relative">
      {/* Sidebar Toggle Button */}
      <button className="lg:hidden p-2 rounded-md" onClick={onToggleSidebar}>
        <img src={sidebarImage} alt="Menu" className="w-6 h-6" />
      </button>

      {/* User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center focus:outline-none"
        >
          <IoPersonCircleOutline className="w-8 h-8 text-gray-600" />
          <span className="ml-2">{storedUsername}</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-[80px] bg-white border border-gray-200 rounded shadow-lg z-10">
            <button
              onClick={handleLogout}
              className="w-full text-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              登出
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNav;
