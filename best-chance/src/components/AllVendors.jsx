import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";

const AllFleet = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, order: null });

  const fetchFleets = async () => {
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
      console.error("Error fetching fleets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleets();
  }, []);

  // Filter items based on the search query
  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.driving_plate
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.mobile.includes(searchQuery) ||
          item.unit_price.includes(searchQuery)
      )
    : items;

  // Sort items based on sortConfig
  const sortedItems = [...filteredItems];
  if (sortConfig.key) {
    sortedItems.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Normalize to string for case insensitive comparison if string
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      // If sorting by unit_price and values are numeric strings, compare as numbers
      if (sortConfig.key === "unit_price") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return sortConfig.order === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === "asc" ? 1 : -1;
      return 0;
    });
  }

  // Handle header click for sorting
  const handleHeaderClick = (key) => {
    if (sortConfig.key === key) {
      // Cycle order asc -> desc -> none
      if (sortConfig.order === "asc") {
        setSortConfig({ key, order: "desc" });
      } else if (sortConfig.order === "desc") {
        setSortConfig({ key: null, order: null });
      } else {
        setSortConfig({ key, order: "asc" });
      }
    } else {
      setSortConfig({ key, order: "asc" });
    }
  };

  // Get sort indicator for header
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.order === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-[rgba(0,0,0,0.04)] rounded-[10px] flex flex-col">
      <h1 className="text-center font-bold my-6 text-[25px]">所有車輛</h1>
      <div className="mb-4 flex justify-between items-center w-full md:w-[58vw] lg:w-[60vw] mx-auto">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-[40px] p-4 text-left rounded-[30px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <ClipLoader color="#000" loading={loading} size={50} />
        </div>
      ) : (
        <div className="md:w-[58vw] lg:w-[60vw] mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="w-1/5 px-4 py-3 text-center text-md font-medium underline uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleHeaderClick("name")}
                  >
                    姓名{getSortIndicator("name")}
                  </th>
                  <th
                    className="w-1/5 px-4 py-3 text-center text-md font-medium underline uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleHeaderClick("company")}
                  >
                    公司{getSortIndicator("company")}
                  </th>
                  <th
                    className="w-1/5 px-4 py-3 text-center text-md font-medium underline uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleHeaderClick("mobile")}
                  >
                    電話{getSortIndicator("mobile")}
                  </th>
                  <th
                    className="w-1/5 px-4 py-3 text-center text-md font-medium underline uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleHeaderClick("driving_plate")}
                  >
                    車牌號碼{getSortIndicator("driving_plate")}
                  </th>
                  <th
                    className="w-1/5 px-4 py-3 text-center text-md font-medium underline uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleHeaderClick("unit_price")}
                  >
                    單價{getSortIndicator("unit_price")}
                  </th>
                </tr>
              </thead>
            </table>
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedItems.map((item) => (
                    <tr key={item.driving_plate} className="hover:bg-gray-50">
                      <td className="w-1/5 px-4 py-4 whitespace-nowrap text-center text-md text-gray-500">
                        {item.name}
                      </td>
                      <td className="w-1/5 px-4 py-4 whitespace-nowrap text-center text-md text-gray-500">
                        {item.company || "無"}
                      </td>
                      <td className="w-1/5 px-4 py-4 whitespace-nowrap text-center text-md text-gray-500">
                        {item.mobile}
                      </td>
                      <td className="w-1/5 px-4 py-4 whitespace-nowrap text-center text-md text-gray-500">
                        {item.driving_plate}
                      </td>
                      <td className="w-1/5 px-4 py-4 whitespace-nowrap text-center text-md text-gray-500">
                        {item.unit_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllFleet;
