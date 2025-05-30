import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";

const MaterialOrder = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();
  const { projectID } = useParams();
  const location = useLocation();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSupplierWarning, setShowSupplierWarning] = useState(false);
  const [attemptedSupplier, setAttemptedSupplier] = useState(null);

  const fetchMaterials = async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        "https://bestchance-accounting-cui.virpluz.io/read-material",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
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

  useEffect(() => {
    // Retrieve selected materials and quantities from location.state when the component mounts
    if (location.state && location.state.selectedMaterials) {
      const storedSelectedMaterials = location.state.selectedMaterials;
      setSelectedItems(storedSelectedMaterials);

      // Populate quantities based on stored selected materials
      const storedQuantities = {};
      storedSelectedMaterials.forEach((material) => {
        storedQuantities[material.material_name] = material.quantity;
      });
      setQuantities(storedQuantities);
    }
  }, [location.state]); // Dependency on location.state to update when navigating back

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
    const currentSupplier = material.supplier_name;

    const isSelected = selectedItems.some(
      (item) => item.material_name === material.material_name
    );

    if (!isSelected) {
      if (selectedSupplier && selectedSupplier !== currentSupplier) {
        setAttemptedSupplier(currentSupplier);
        setShowSupplierWarning(true);
        return;
      }

      // Allow adding the material
      setSelectedItems((prevSelected) => [...prevSelected, material]);
      setQuantities((prev) => ({
        ...prev,
        [material.material_name]: 1,
      }));
      if (!selectedSupplier) {
        setSelectedSupplier(currentSupplier);
      }
    } else {
      // Deselecting
      setSelectedItems((prevSelected) =>
        prevSelected.filter(
          (item) => item.material_name !== material.material_name
        )
      );
      setQuantities((prevQuantities) => {
        const newQuantities = { ...prevQuantities };
        delete newQuantities[material.material_name];
        return newQuantities;
      });

      // Reset selected supplier if all materials are deselected
      if (
        selectedItems.filter(
          (item) => item.material_name !== material.material_name
        ).length === 0
      ) {
        setSelectedSupplier(null);
      }
    }
  };

  const handleQuantityChange = (material, value) => {
    const quantity = parseInt(value) || 0;

    setQuantities((prevQuantities) => {
      const newQuantities = {
        ...prevQuantities,
        [material.material_name]: quantity > 0 ? quantity : "",
      };

      setSelectedItems((prevSelected) => {
        const isSelected = prevSelected.some(
          (item) => item.material_name === material.material_name
        );
        if (quantity > 0) {
          if (!isSelected) {
            return [...prevSelected, material];
          }
        } else {
          return prevSelected.filter(
            (item) => item.material_name !== material.material_name
          );
        }
        return prevSelected;
      });

      return newQuantities;
    });
  };

  const handleNext = () => {
    // Prepare the data to pass to the next component
    const selectedWithQuantities = selectedItems.map((item) => ({
      ...item,
      quantity: quantities[item.material_name] || 0,
    }));

    // Navigate to the next component, passing the data as state
    navigate(`/material-confirmation/${projectID}`, {
      state: {
        selectedMaterials: selectedWithQuantities,
        quantities: quantities, // Pass the quantities
      },
    });
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
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[60vh]">
              <div className="max-h-[60vh] overflow-y-auto">
                {sortedItems.map(({ supplier, materials }) => (
                  <div key={supplier} className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 p-4 bg-gray-100 rounded-t-lg">
                      {supplier}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-12 px-2 py-3"></th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                              材料名稱
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] whitespace-nowrap">
                              單位
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] whitespace-nowrap">
                              單價 (HKD)
                            </th>
                            <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px] whitespace-nowrap">
                              數量
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {materials.map((item) => (
                            <tr
                              key={item.material_name}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-2 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.some(
                                    (selectedItem) =>
                                      selectedItem.material_name ===
                                      item.material_name
                                  )}
                                  onChange={() => handleCheckboxChange(item)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mx-auto block"
                                />
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {item.material_name}
                              </td>
                              <td className="px-2 py-4 text-center text-sm text-gray-500 whitespace-nowrap">
                                {item.unit}
                              </td>
                              <td className="px-2 py-4 text-center text-sm text-gray-500 whitespace-nowrap">
                                ${item.unit_price}
                              </td>
                              <td className="px-2 py-4 whitespace-nowrap">
                                <div className="flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={quantities[item.material_name] ?? ""}
                                    onChange={(e) =>
                                      handleQuantityChange(item, e.target.value)
                                    }
                                    className="w-20 px-2 py-1 border text-center border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next button */}
          {selectedItems.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-[30px] w-[100px]"
              >
                確定
              </button>
            </div>
          )}
        </>
      )}

      {showSupplierWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg text-center max-w-[90%]">
            <p className="text-red-600 font-semibold mb-4">
              一次只能選擇一個供應商的材料！
            </p>
            <p className="mb-2 text-gray-700">
              目前已選供應商：
              <span className="font-semibold">{selectedSupplier}</span>
            </p>
            <p className="mb-4 text-gray-700">
              嘗試選擇的供應商：
              <span className="font-semibold">{attemptedSupplier}</span>
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => setShowSupplierWarning(false)}
            >
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialOrder;
