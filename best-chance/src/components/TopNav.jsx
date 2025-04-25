import React from "react";

const TopNav = () => {
  return (
    <div className="flex items-center justify-end bg-white border-b-[1px] border-[rgb(0,0,0,0.1)] p-4 h-[80px]">
      {/* User Profile Section */}
      <div className="flex items-center">
        <img
          src="https://via.placeholder.com/40"
          alt="User"
          className="rounded-full w-8 h-8 border border-gray-300"
        />
        <span className="ml-2">Limbu</span>
      </div>
    </div>
  );
};

export default TopNav;
