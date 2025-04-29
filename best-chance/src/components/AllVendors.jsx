import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";

const AllVendors = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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

      // Handle numeric fields differently
      if (sortConfig.key === "unit_price") {
        const aVal = parseFloat(a[sortConfig.key]) || 0;
        const bVal = parseFloat(b[sortConfig.key]) || 0;
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        // Handle string fields
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
      <h1 className="text-center font-bold my-6 text-[25px]">所有車輛</h1>
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
          <ClipLoader color="#000" loading={loading} size={50} />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden w-full px-4 sm:px-0 sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[60vh]">
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("name")}
                    >
                      <div className="flex items-center justify-center">
                        姓名
                        {sortConfig.key === "name" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
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
                      className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
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
                      className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
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
                      className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
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
                      <td className="px-4 py-4 text-center text-md text-gray-500">
                        {item.name}
                      </td>
                      <td className="px-4 py-4 text-center text-md text-gray-500">
                        {item.company || "無"}
                      </td>
                      <td className="px-4 py-4 text-center text-md text-gray-500">
                        {item.mobile}
                      </td>
                      <td className="px-4 py-4 text-center text-md text-gray-500">
                        {item.driving_plate}
                      </td>
                      <td className="px-4 py-4 text-center text-md text-gray-500">
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

export default AllVendors;
