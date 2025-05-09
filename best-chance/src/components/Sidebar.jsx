import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProjectImage from "../Assets/Image/Project.png";
import SupplierImage from "../Assets/Image/agreement.png";
import VendorImage from "../Assets/Image/vendor.png";
import CostAnalysisImage from "../Assets/Image/sales.png";
import QuotationImage from "../Assets/Image/Quotation.png";
import InvoiceImage from "../Assets/Image/Invoice.png";
import FundingImage from "../Assets/Image/payment-method-1.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { img: ProjectImage, text: "工程項目", path: "/" },
    { img: SupplierImage, text: "供應商", path: "/supplier" },
    { img: VendorImage, text: "車手", path: "/vendor" },
    { img: CostAnalysisImage, text: "成本分析", path: "/cost-analysis" },
    { img: QuotationImage, text: "報價" },
    { img: InvoiceImage, text: "發票" },
    { img: FundingImage, text: "資金" },
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
          <div
            className="flex items-center justify-start p-4 my-8 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => {
              navigate("/");
              // Close sidebar on smaller screens after navigation
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
          >
            <h2 className="text-2xl font-bold text-gray-800 ">Best Chance</h2>
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
                    className={`flex items-center w-full p-3 rounded-md transition-all ${
                      location.pathname === item.path
                        ? "bg-gray-100 text-gray-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    } ${!item.path ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <img
                      src={item.img}
                      alt={item.text}
                      className="w-6 h-6 mr-3 opacity-70"
                    />
                    <span className="text-md">{item.text}</span>
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
