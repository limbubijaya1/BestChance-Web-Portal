import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { SlOptionsVertical } from "react-icons/sl";
import { IoInformationCircleOutline } from "react-icons/io5";
import EditMaterialModal from "./EditMaterialModal";
import AddMaterialModal from "./AddMaterialModal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import AddSupplierModal from "./AddSupplierModal";
import ShowSupplierInformationModal from "./ShowSupplierInformationModal";

const AllSuppliers = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [openDropdownMenu, setOpenDropdownMenu] = useState(null);
  const [editingMaterialModal, setEditingMaterialModal] = useState(null);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    material_name: "",
    supplier_name: "",
    unit: "",
    unit_price: "",
  });

  const fetchSupplierWithMaterial = async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        "https://bestchance-accounting-cui.virpluz.io/read-all-suppliers-with-materials",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      console.log(response.data.all_supplier);
      setItems(response.data.all_supplier); // Updated to match the response structure
    } catch (error) {
      console.error("Error fetching suppliers with materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (material) => {
    const token = Cookies.get("access_token");

    try {
      const response = await axios.delete(
        `https://bestchance-accounting-cui.virpluz.io/delete-material/${material.material_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      console.log(response.data);
      fetchSupplierWithMaterial(); // Refresh list
    } catch (error) {
      console.error("Failed to delete material:", error);
    }
  };

  useEffect(() => {
    fetchSupplierWithMaterial();
  }, []);

  const handleShowSupplierInfo = (supplier) => {
    setSelectedSupplier(supplier); // Set the supplier data to show in the modal
    setShowSupplierModal(true); // Show the modal
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = () => {
    let sortableItems = items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sortableItems = sortableItems
        .map((supplier) => {
          const filteredMaterials = supplier.materials.filter((material) =>
            [
              material.material_name,
              material.unit,
              material.unit_price.toString(),
            ].some((field) => field.toLowerCase().includes(query))
          );
          const matchesSupplier = supplier.company_name
            .toLowerCase()
            .includes(query);
          if (matchesSupplier || filteredMaterials.length > 0) {
            return {
              ...supplier,
              materials: matchesSupplier
                ? supplier.materials
                : filteredMaterials,
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    return sortableItems;
  };

  const sortedItems = getSortedItems();

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      <h1 className="text-center font-bold my-6 text-[25px]">所有供應商</h1>
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
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[60vh]">
            <div className="max-h-[60vh] overflow-y-auto">
              {sortedItems.map((supplier) => (
                <div key={supplier.company_name} className="mb-4">
                  <div className="flex justify-between items-center p-4 bg-gray-100 rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {supplier.company_name}
                    </h2>
                    <IoInformationCircleOutline
                      className="cursor-pointer"
                      size={25}
                      onClick={() => handleShowSupplierInfo(supplier)}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer w-[200px] sm:w-[340px] md:w-[370px] lg:w-[480px] xl:w-[520px] flex"
                            onClick={() => requestSort("material_name")}
                          >
                            材料名稱
                          </th>
                          <th
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer min-w-[60px]"
                            onClick={() => requestSort("unit")}
                          >
                            單位
                          </th>
                          <th
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer min-w-[100px]"
                            onClick={() => requestSort("unit_price")}
                          >
                            單價 (HKD)
                          </th>
                          <th className=" py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[20px]"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {supplier.materials.length > 0
                          ? supplier.materials.map((item) => (
                              <tr
                                key={item.material_name}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-4 text-sm text-gray-700 w-full sm:w-[340px] md:w-[370px] lg:w-[480px] xl:w-[520px] flex">
                                  {item.material_name}
                                </td>
                                <td className="px-4 py-4 text-center text-sm text-gray-700">
                                  {item.unit}
                                </td>
                                <td className="px-4 py-4 text-center text-sm text-gray-700">
                                  ${item.unit_price}
                                </td>
                                <td className="relative py-4 text-center text-sm">
                                  <button
                                    onClick={() =>
                                      setOpenDropdownMenu(
                                        openDropdownMenu === item.material_name
                                          ? null
                                          : item.material_name
                                      )
                                    }
                                    className="hover:text-blue-500"
                                  >
                                    <SlOptionsVertical />
                                  </button>
                                  {openDropdownMenu === item.material_name && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                                      <button
                                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => {
                                          const {
                                            created_at,
                                            updated_at,
                                            ...cleanedItem
                                          } = item; // Remove unwanted fields
                                          setEditingMaterialModal(cleanedItem);
                                          setOpenDropdownMenu(null);
                                        }}
                                      >
                                        編輯
                                      </button>
                                      <button
                                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-100"
                                        onClick={() => {
                                          setConfirmDeleteItem(item);
                                          setOpenDropdownMenu(null);
                                        }}
                                      >
                                        刪除
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          : null}
                      </tbody>

                      {!searchQuery && (
                        <tbody>
                          <tr
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setShowAddMaterialModal(true);
                              setNewMaterial({
                                material_name: "",
                                supplier_name: supplier.company_name,
                                unit: "",
                                unit_price: "",
                              });
                            }}
                          >
                            <td colSpan="4" className="p-4 border-b">
                              <button className="w-full border-2 border-dashed border-gray-400 py-2 text-blue-500 font-bold hover:bg-gray-50 transition rounded-md">
                                + 加新材料
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>
              ))}
              {!searchQuery && (
                <div
                  className="flex justify-center items-center p-4 bg-gray-100 rounded-t-lg hover:bg-gray-200 cursor-pointer"
                  onClick={() => setShowAddSupplierModal(true)}
                >
                  <button className="text-center text-blue-500 font-bold w-full">
                    + 加供應商
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingMaterialModal && (
        <EditMaterialModal
          initialData={editingMaterialModal}
          onClose={() => setEditingMaterialModal(null)}
          onSuccess={() => {
            setEditingMaterialModal(null);
            fetchSupplierWithMaterial();
          }}
        />
      )}

      {showAddMaterialModal && (
        <AddMaterialModal
          visible={showAddMaterialModal}
          initialData={newMaterial}
          onClose={() => setShowAddMaterialModal(false)}
          onSuccess={() => {
            fetchSupplierWithMaterial();
            setNewMaterial({
              material_name: "",
              supplier_name: "",
              unit: "",
              unit_price: "",
            });
          }}
        />
      )}

      {confirmDeleteItem && (
        <ConfirmDeleteModal
          productName={confirmDeleteItem.material_name}
          onConfirm={async () => {
            await deleteMaterial(confirmDeleteItem); // Your delete function
            setConfirmDeleteItem(null);
          }}
          onCancel={() => setConfirmDeleteItem(null)}
        />
      )}

      {showAddSupplierModal && (
        <AddSupplierModal
          visible={showAddSupplierModal}
          onClose={() => setShowAddSupplierModal(false)}
          onSuccess={() => {
            fetchSupplierWithMaterial(); // Refresh supplier list
            setShowAddSupplierModal(false);
          }}
        />
      )}

      {showSupplierModal && selectedSupplier && (
        <ShowSupplierInformationModal
          visible={showSupplierModal}
          supplierInfo={selectedSupplier}
          onClose={() => setShowSupplierModal(false)}
          onSuccess={() => {
            setShowSupplierModal(false);
            fetchSupplierWithMaterial();
          }}
        />
      )}
    </div>
  );
};

export default AllSuppliers;
