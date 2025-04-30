import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { IoMdArrowBack, IoMdCheckmark, IoMdClose } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import { FaMapMarkerAlt } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

const CombinedOrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectID } = useParams();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [startingLocation, setStartingLocation] = useState("");
  const [locationError, setLocationError] = useState("");

  // New states for success, error, and loading
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedMaterials, setSelectedMaterials] = useState(
    location.state?.selectedMaterials || []
  );
  const [quantities, setQuantities] = useState(
    location.state?.quantities || {}
  );
  const [selectedFleet, setSelectedFleet] = useState(
    location.state?.selectedFleet || null
  );
  const [startingLocationState, setStartingLocationState] = useState(
    location.state?.startingLocation || ""
  );
  const [deliveryDateState, setDeliveryDateState] = useState(
    location.state?.deliveryDate || ""
  );

  useEffect(() => {
    if (location.state) {
      setStartingLocation(location.state.startingLocation || "");
      setDeliveryDate(location.state.deliveryDate || "");
    }
  }, [location.state]);

  // useEffect for success popup
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false); // Hide success popup
        navigate(`/order/${projectID}`); // Navigate back to project page
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, navigate, projectID]);

  // useEffect for error popup
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null); // Clear error message
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleConfirm = async () => {
    if (!startingLocation) {
      setLocationError("請輸入起運地點");
      return;
    }

    if (!deliveryDate) {
      setDateError("請選擇交貨日期");
      return;
    }

    // Prepare materials data in the required format
    const materialsToSend = selectedMaterials.map((item) => ({
      material_name: item.material_name,
      material_qty: quantities[item.material_name]
        ? quantities[item.material_name].toString()
        : "0",
    }));

    // Prepare fleet data and price
    let fleetPrice = "";
    let driverName = "";
    if (selectedFleet) {
      driverName = selectedFleet.name;
      fleetPrice = selectedFleet.unit_price;
    }

    // Construct the request body according to the specified format
    const requestBody = {
      starting_location: startingLocation,
      driver_name: driverName,
      supplier_name:
        selectedMaterials.length > 0 ? selectedMaterials[0].supplier_name : "", // Taking the first material's supplier
      materials: materialsToSend,
      delivery_date: deliveryDate,
      fleet_price: fleetPrice,
    };

    console.log("Request Body:", requestBody);

    setLoading(true); // Start loading
    try {
      const token = Cookies.get("access_token");
      const response = await axios.post(
        `http://34.44.189.201/order-fleet/${projectID}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
    navigate(`/order-next/${projectID}`, {
      state: {
        selectedMaterials: selectedMaterials,
        quantities: quantities,
        selectedFleet: selectedFleet,
        startingLocation: startingLocation,
        deliveryDate: deliveryDate,
      },
    });
  };

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                起始地點 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="請輸入起運地點"
                  value={startingLocation}
                  onChange={(e) => {
                    setStartingLocation(e.target.value);
                    setLocationError("");
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {locationError && (
                <p className="mt-1 text-sm text-red-600">{locationError}</p>
              )}
            </div>

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

            {selectedFleet && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  已選擇車隊
                </h4>
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="flex justify-between py-1">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFleet.name}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFleet.unit_price} HKD
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleConfirm}
                disabled={loading}
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
            <p className="text-gray-700">將在3秒後返回專案頁面...</p>
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

export default CombinedOrderConfirmation;
