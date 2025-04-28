import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";

const AllFleet = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const fetchMaterials = async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get("http://34.44.189.201/read-material", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setItems(response.data.all_material);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Improved sorting function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted and filtered items
  const getSortedItems = () => {
    // First group by supplier
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.supplier_name]) {
        acc[item.supplier_name] = [];
      }
      acc[item.supplier_name].push(item);
      return acc;
    }, {});

    // Convert to array of suppliers with materials
    let sortableItems = Object.keys(groupedItems).map((supplier) => ({
      supplier,
      materials: [...groupedItems[supplier]],
    }));

    // Apply search filter
    if (searchQuery) {
      sortableItems = sortableItems
        .map(({ supplier, materials }) => {
          const filteredMaterials = materials.filter(
            (item) =>
              item.material_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              item.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.unit_price.toString().includes(searchQuery) || // Check unit price as string
              supplier.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return {
            supplier,
            materials: filteredMaterials,
          };
        })
        .filter(({ materials }) => materials.length > 0); // Keep only suppliers with matching materials
    }

    // Apply sorting if configured
    if (sortConfig.key) {
      sortableItems.forEach(({ materials }) => {
        materials.sort((a, b) => {
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
      });
    }

    return sortableItems;
  };

  const sortedItems = getSortedItems();

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      <h1 className="text-center font-bold my-6 text-[25px]">所有材料</h1>
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
                      onClick={() => requestSort("supplier_name")}
                    >
                      <div className="flex items-center justify-center">
                        供應商
                        {sortConfig.key === "supplier_name" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("material_name")}
                    >
                      <div className="flex items-center">
                        材料名稱
                        {sortConfig.key === "material_name" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("unit")}
                    >
                      <div className="flex items-center justify-center">
                        單位
                        {sortConfig.key === "unit" && (
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
                  {sortedItems.map(({ supplier, materials }) =>
                    materials.map((item, index) => (
                      <tr
                        key={item.material_name}
                        className={`hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-gray-50" : ""
                        }`}
                      >
                        {index === 0 && (
                          <td
                            rowSpan={materials.length}
                            className="px-4 py-4 text-center text-md text-gray-500"
                          >
                            {supplier}
                          </td>
                        )}
                        <td className="px-4 py-4 text-md text-gray-500 text-left">
                          {item.material_name}
                        </td>
                        <td className="px-4 py-4 text-center text-md text-gray-500">
                          {item.unit}
                        </td>
                        <td className="px-4 py-4 text-center text-md text-gray-500">
                          {item.unit_price}
                        </td>
                      </tr>
                    ))
                  )}
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
