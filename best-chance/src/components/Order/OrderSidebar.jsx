import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const Sidebar = ({ isOpen, onClose }) => {
  const { projectID } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { text: "訂單合併", path: `/order/${projectID}` },
    { text: "訂購材料", path: `/material/${projectID}` },
    { text: "訂購車隊", path: `/fleet/${projectID}` },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 z-30 transition-transform duration-300 ease-in-out bg-white border-r border-gray-300 lg:relative lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-center p-4 my-8 ">
            <h2 className="text-2xl font-bold text-gray-800">BestChance</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      // Close sidebar on smaller screens after navigation
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`flex items-center w-full p-3 justify-left rounded-md transition-all ${
                      location.pathname === item.path
                        ? "bg-gray-100 text-gray-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    } ${!item.path ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <h1 className="text-md text-center ">{item.text}</h1>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Overlay for smaller screens */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
