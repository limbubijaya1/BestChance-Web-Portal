import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { SlOptionsVertical } from "react-icons/sl";
import AddFleetModal from "./AddFleetModal";
import EditFleetModal from "./EditFleetModal";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

const AllVendors = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [openDropdownMenu, setOpenDropdownMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  const fetchFleet = async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        "https://bestchance-accounting-cui.virpluz.io/read-fleets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setItems(response.data.all_fleet);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteFleet = async (fleetId) => {
    const token = Cookies.get("access_token");
    try {
      await axios.delete(
        `https://bestchance-accounting-cui.virpluz.io/delete-fleet`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          data: { fleet_id: fleetId.fleet_id },
        }
      );
      fetchFleet();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const requestSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedItems = [...items]
    .filter((item) =>
      Object.values(item).some((field) =>
        (field ? field.toString() : "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      const aVal =
        sortConfig.key === "unit_price"
          ? parseFloat(a[sortConfig.key]) || 0
          : a[sortConfig.key]?.toString() || ""; // Handle null
      const bVal =
        sortConfig.key === "unit_price"
          ? parseFloat(b[sortConfig.key]) || 0
          : b[sortConfig.key]?.toString() || ""; // Handle null

      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
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
          <ClipLoader color="#3B82F6" loading={loading} size={50} />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[60vh]">
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    {["姓名", "公司", "電話", "車牌號碼", "單價 (HKD)"].map(
                      (header, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 min-w-[100px] text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort(header.toLowerCase())}
                        >
                          {header}
                          {sortConfig.key === header.toLowerCase() && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </th>
                      )
                    )}
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedItems.map((item, index) => (
                    <tr
                      key={item.driving_plate}
                      className="hover:bg-gray-50 relative"
                    >
                      {[
                        "name",
                        "company",
                        "mobile",
                        "driving_plate",
                        "unit_price",
                      ].map((key) => (
                        <td
                          key={key}
                          className="px-4 py-4 text-center text-md text-gray-500"
                        >
                          {item[key] || "無"}
                        </td>
                      ))}
                      <td className="relative py-4 text-center text-sm w-[20px]">
                        <button
                          onClick={() =>
                            setOpenDropdownMenu(
                              openDropdownMenu === index ? null : index
                            )
                          }
                          className="hover:text-blue-500"
                        >
                          <SlOptionsVertical />
                        </button>
                        {openDropdownMenu === index && (
                          <div className="absolute right-4 mt-2 w-28 bg-white border border-gray-200 shadow-lg rounded-md z-10">
                            <button
                              onClick={() => {
                                setCurrentEdit({
                                  ...item,
                                  id: item.id || item.fleet_id || item._id,
                                });
                                setIsModalOpen(true);
                                setOpenDropdownMenu(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              編輯
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
                  ))}
                </tbody>
                <tbody>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <td
                      colSpan={6}
                      className="text-center py-6 text-blue-500 font-bold"
                    >
                      + 加入新車隊
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && currentEdit && (
        <EditFleetModal
          currentEdit={currentEdit}
          setCurrentEdit={setCurrentEdit}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchFleet}
        />
      )}

      {isAddModalOpen && (
        <AddFleetModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchFleet}
        />
      )}

      {confirmDeleteItem && (
        <ConfirmDeleteModal
          productName={confirmDeleteItem.name}
          onConfirm={async () => {
            await deleteFleet(confirmDeleteItem); // Your delete function
            setConfirmDeleteItem(null);
          }}
          onCancel={() => setConfirmDeleteItem(null)}
        />
      )}
    </div>
  );
};

export default AllVendors;
