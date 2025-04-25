import React from "react";
import ProjectImage from "../Assets/Image/Project.png";
import SupplierImage from "../Assets/Image/agreement.png";
import VendorImage from "../Assets/Image/vendor.png";
import CostAnalysisImage from "../Assets/Image/sales.png";
import QuotationImage from "../Assets/Image/Quotation.png";
import InvoiceImage from "../Assets/Image/Invoice.png";
import FundingImage from "../Assets/Image/payment-method-1.png";

const Sidebar = ({ isOpen }) => {
  return (
    <div>
      {/* Sidebar */}
      {isOpen && (
        <div className="w-64 h-screen p-4 fixed flex flex-col items-center border-e border-gray-300 bg-white md:w-1/4 lg:w-64">
          <h2 className="text-2xl font-bold my-8 w-full flex items-center justify-center">
            BestChance
          </h2>
          <div className="w-full">
            <ul className="list-none justify-start flex flex-col items-center ">
              {[
                { img: ProjectImage, text: "工程項目" },
                { img: SupplierImage, text: "供應商" },
                { img: VendorImage, text: "判項" },
                { img: CostAnalysisImage, text: "成本分析" },
                { img: QuotationImage, text: "報價" },
                { img: InvoiceImage, text: "發票" },
                { img: FundingImage, text: "資金" },
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center my-2 py-2 cursor-pointer hover:bg-gray-200 rounded-md w-full justify-center"
                >
                  <div className="flex items-center justify-center w-full">
                    <img
                      src={item.img}
                      alt={item.text}
                      className="mr-2 w-6 h-6"
                    />
                    <span className="text-lg">{item.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
