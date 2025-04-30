import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { IoMdArrowBack, IoMdCheckmark, IoMdClose } from "react-icons/io"; // Import IoMdClose for error
import { FiCalendar } from "react-icons/fi";
import { ClipLoader } from "react-spinners"; // Import ClipLoader

const MaterialOrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectID } = useParams();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [success, setSuccess] = useState(false); // State for success popup
  const [error, setError] = useState(null); // State for error message
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Access the selected materials and quantities from the location state
  const [selectedMaterials, setSelectedMaterials] = useState(
    location.state?.selectedMaterials || []
  );
  const [quantities, setQuantities] = useState(
    location.state?.quantities || {}
  );

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(`/material/${projectID}`); // Navigate back to project page
      }, 3000);

      return () => clearTimeout(timer); // Clear timeout if component unmounts
    }
  }, [success, navigate, projectID]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null); // Clear error message after 3 seconds
      }, 3000);

      return () => clearTimeout(timer); // Clear timeout if component unmounts
    }
  }, [error]);

  const handleConfirm = async () => {
    if (!deliveryDate) {
      setDateError("請選擇交貨日期");
      return;
    }

    // Prepare materials data in the required format
    const materialsToSend = selectedMaterials.map((item) => ({
      supplier_name: item.supplier_name,
      material_name: item.material_name,
      material_qty: quantities[item.material_name]
        ? quantities[item.material_name].toString()
        : "0",
      delivery_date: deliveryDate,
    }));

    // Construct the request body according to the specified format
    const requestBody = {
      materials: materialsToSend,
    };

    console.log("Request Body:", requestBody);

    setLoading(true); // Start loading
    try {
      const token = Cookies.get("access_token");
      const response = await axios.post(
        `http://34.44.189.201/order-material/${projectID}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Important: Specify content type
          },
        }
      );

      console.log("Order successful:", response.data);
      setSuccess(true); // Show success popup
    } catch (err) {
      console.error("Order failed:", err);
      setError("訂購失敗，請稍後再試。"); // Set error message
    } finally {
      setLoading(false); // End loading
    }
  };
  const handleBack = () => {
    navigate(`/material/${projectID}`, {
      state: {
        selectedMaterials: selectedMaterials,
        quantities: quantities,
      },
    });
  };

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      {/* Header with back button and centered title */}
      <div className="flex items-center justify-center relative mt-6">
        <button
          onClick={handleBack}
          className="absolute left-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm"
        >
          <IoMdArrowBack className="size-[20px]" />
        </button>
        <h1 className="text-center font-bold text-[25px]">訂購詳情</h1>
      </div>
      <div className="flex justify-center mt-6">
        <div className="w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]">
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Improved date picker with icon */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交貨日期 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => {
                    setDeliveryDate(e.target.value);
                    setDateError("");
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {dateError && (
                <p className="mt-1 text-sm text-red-600">{dateError}</p>
              )}
            </div>

            {/* Materials Order summary */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                已選擇 {selectedMaterials.length} 項材料
              </h4>
              <div className="bg-gray-50 p-2 rounded-md">
                {selectedMaterials.map((item) => (
                  <div
                    key={item.material_name}
                    className="flex justify-between py-1"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {item.material_name}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {quantities[item.material_name] || 0} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <div className="flex justify-center">
              <button
                onClick={handleConfirm}
                disabled={loading} // Disable button while loading
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-[30px] shadow-sm text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              >
                {loading ? <ClipLoader color="white" size={20} /> : "確認訂購"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {success && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdCheckmark className="text-green-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">訂購成功!</h2>
            <p className="text-gray-700">將在3秒後返回物料頁面...</p>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {error && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdClose className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">訂購失敗!</h2>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialOrderConfirmation;
