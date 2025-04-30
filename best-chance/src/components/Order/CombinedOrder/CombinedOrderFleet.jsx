import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate, useParams, useLocation } from "react-router-dom"; // Import useLocation
import { IoMdArrowBack } from "react-icons/io";

const CombinedFleetOrder = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedPrice, setEditedPrice] = useState("");
  const navigate = useNavigate();
  const { projectID } = useParams();
  const location = useLocation(); // Use useLocation

  const fetchVendors = async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get("http://34.44.189.201/read-fleets", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setItems(response.data.all_fleet);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    // Retrieve selected fleet from location.state when the component mounts
    if (location.state && location.state.selectedFleet) {
      const storedSelectedFleet = location.state.selectedFleet;
      setSelectedItem(storedSelectedFleet);
      setEditedPrice(storedSelectedFleet.unit_price);
    }
  }, [location.state]); // Dependency on location.state to update when navigating back

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleCheckboxChange = (item) => {
    if (selectedItem && selectedItem.driving_plate === item.driving_plate) {
      setSelectedItem(null);
      setEditedPrice("");
    } else {
      setSelectedItem(item);
      setEditedPrice(item.unit_price);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and empty string
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setEditedPrice(value);
    }
  };

  const handleNext = () => {
    if (!selectedItem) return;

    const selectedWithPrice = {
      ...selectedItem,
      unit_price: editedPrice || selectedItem.unit_price,
    };

    // Get existing state from location
    const existingState = location.state || {};

    navigate(`/order-confirmation/${projectID}`, {
      state: {
        ...existingState, // Merge existing state
        selectedFleet: selectedWithPrice,
      },
    });
  };

  const handleBack = () => {
    navigate(`/order/${projectID}`, {
      state: location.state, // Pass the current state back
    });
  };

  const sortedItems = [...items]
    .filter((item) => {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mobile.includes(searchQuery) ||
        item.driving_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unit_price.toString().includes(searchQuery)
      );
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      if (sortConfig.key === "unit_price") {
        const aVal = parseFloat(a[sortConfig.key]) || 0;
        const bVal = parseFloat(b[sortConfig.key]) || 0;
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aVal < bVal) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      }
    });

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      {/* Header with back button and centered title */}
      <div className="flex items-center justify-center relative my-6">
        <button
          onClick={handleBack} // Use the new handleBack function
          className="absolute left-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm"
        >
          <IoMdArrowBack className="size-[20px]" />
        </button>
        <h1 className="text-center font-bold text-[25px]">所有車輛</h1>
      </div>

      <div className="mb-4 flex flex-col items-center gap-2">
        <div className="w-full px-4 sm:px-0 sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-[40px] p-4 text-left rounded-[30px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <ClipLoader color="#3B82F6" loading={loading} size={50} />
        </div>
      ) : (
        <>
          {/* Scrollable Fleet table */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[60vh]">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-12 px-2 py-3"></th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-32"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center">
                          姓名
                          {sortConfig.key === "name" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-32"
                        onClick={() => requestSort("company")}
                      >
                        <div className="flex items-center justify-center">
                          公司
                          {sortConfig.key === "company" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-32"
                        onClick={() => requestSort("mobile")}
                      >
                        <div className="flex items-center justify-center">
                          電話
                          {sortConfig.key === "mobile" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-32"
                        onClick={() => requestSort("driving_plate")}
                      >
                        <div className="flex items-center justify-center">
                          車牌號碼
                          {sortConfig.key === "driving_plate" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-32"
                        onClick={() => requestSort("unit_price")}
                      >
                        <div className="flex items-center justify-center">
                          單價 (HKD)
                          {sortConfig.key === "unit_price" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedItems.map((item) => (
                      <tr key={item.driving_plate} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap">
                          <input
                            type="radio"
                            name="fleetSelection"
                            checked={
                              selectedItem?.driving_plate === item.driving_plate
                            }
                            onChange={() => handleCheckboxChange(item)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mx-auto block"
                          />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                          {item.company || "無"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                          {item.mobile}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap text-center">
                          {item.driving_plate}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {selectedItem?.driving_plate ===
                          item.driving_plate ? (
                            <input
                              type="text"
                              value={editedPrice}
                              onChange={handlePriceChange}
                              className="w-24 px-2 py-1 border text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span>{item.unit_price}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Confirm button */}
          {selectedItem && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-[30px] inline-flex items-center w-[100px] justify-center"
              >
                確認
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CombinedFleetOrder;
