import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack, IoMdCheckmark } from "react-icons/io";
import { FiSearch } from "react-icons/fi";

const MaterialOrder = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

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

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = () => {
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.supplier_name]) {
        acc[item.supplier_name] = [];
      }
      acc[item.supplier_name].push(item);
      return acc;
    }, {});

    let sortableItems = Object.keys(groupedItems).map((supplier) => ({
      supplier,
      materials: [...groupedItems[supplier]],
    }));

    if (searchQuery) {
      sortableItems = sortableItems
        .map(({ supplier, materials }) => {
          const filteredMaterials = materials.filter(
            (item) =>
              item.material_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              item.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.unit_price.toString().includes(searchQuery) ||
              supplier.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return {
            supplier,
            materials: filteredMaterials,
          };
        })
        .filter(({ materials }) => materials.length > 0);
    }

    if (sortConfig.key) {
      sortableItems.forEach(({ materials }) => {
        materials.sort((a, b) => {
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
      });
    }

    return sortableItems;
  };

  const sortedItems = getSortedItems();

  const handleCheckboxChange = (material) => {
    setSelectedItems((prevSelected) => {
      const isSelected = prevSelected.includes(material);
      const newQuantities = { ...quantities };

      if (isSelected) {
        delete newQuantities[material.material_name];
        setQuantities(newQuantities);
        return prevSelected.filter((item) => item !== material);
      } else {
        setQuantities({
          ...newQuantities,
          [material.material_name]: 1,
        });
        return [...prevSelected, material];
      }
    });
  };

  const handleQuantityChange = (material, value) => {
    const quantity = parseInt(value) || 0;

    setQuantities((prevQuantities) => {
      const newQuantities = {
        ...prevQuantities,
        [material.material_name]: quantity > 0 ? quantity : "",
      };

      if (quantity > 0) {
        setSelectedItems((prevSelected) => {
          if (!prevSelected.includes(material)) {
            return [...prevSelected, material];
          }
          return prevSelected;
        });
      } else {
        setSelectedItems((prevSelected) =>
          prevSelected.filter((item) => item !== material)
        );
      }

      return newQuantities;
    });
  };

  const handleConfirm = () => {
    const selectedWithQuantities = selectedItems.map((item) => ({
      material: item,
      quantity: quantities[item.material_name] || 0,
    }));
    console.log("Selected materials with quantities:", selectedWithQuantities);
    // Add your confirmation logic here (e.g., sending selected items to the server)
  };

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      {/* Header with back button and centered title */}
      <div className="flex items-center justify-center relative my-6">
        <button
          onClick={() => navigate("/")}
          className="absolute left-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm"
        >
          <IoMdArrowBack className="size-[20px]" />
        </button>
        <h1 className="text-center font-bold text-[25px]">所有材料</h1>
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
          {/* Scrollable Materials table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              {sortedItems.map(({ supplier, materials }) => (
                <div key={supplier} className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 p-4 bg-gray-100 rounded-t-lg">
                    {supplier}
                  </h2>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-12 px-4 py-3"></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          材料名稱
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          style={{ width: "100px" }}
                        >
                          單位
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          style={{ width: "100px" }}
                        >
                          單價 (HKD)
                        </th>
                        <th
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          style={{ width: "100px" }}
                        >
                          數量
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {materials.map((item) => (
                        <tr
                          key={item.material_name}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item)}
                              onChange={() => handleCheckboxChange(item)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.material_name}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-gray-500">
                            {item.unit}
                          </td>
                          <td className="px-4 py-4 text-center text-sm text-gray-500">
                            ${item.unit_price}
                          </td>
                          <td className="px-4 py-4 flex justify-center text-center">
                            <input
                              type="number"
                              min="1"
                              value={quantities[item.material_name] ?? ""}
                              onChange={(e) =>
                                handleQuantityChange(item, e.target.value)
                              }
                              className="w-20 px-2 py-1 border text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* Selection summary and confirm button */}
          {selectedItems.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center">
                <div className="text-sm text-blue-800">
                  已選擇 {selectedItems.length} 項材料
                </div>
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <IoMdCheckmark className="mr-1" />
                  確認訂購
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MaterialOrder;
