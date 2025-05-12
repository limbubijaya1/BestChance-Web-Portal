import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import EditProjectExpenseModal from "./EditProjectExpenseModal";
import ConfirmDeleteModal from "../../ConfirmDeleteModal";

const ProjectExpense = () => {
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'material', 'fleet', 'operation'
  const navigate = useNavigate();
  const { projectID } = useParams();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Fixed column widths for consistent alignment
  const columnWidths = {
    expense_name: "200px",
    starting_location: "120px",
    destination: "120px",
    delivery_date: "120px",
    qty: "80px",
    unit: "80px",
    unit_price: "100px",
    total_price: "100px",
    actions: "60px",
  };

  const fetchOperationExpenses = useCallback(async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        `http://34.44.189.201/read-project-expenses/${projectID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setGroupedExpenses(response.data.grouped_expenses);
    } catch (error) {
      console.error("Error fetching operation expenses:", error);
      setGroupedExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [projectID]);

  useEffect(() => {
    fetchOperationExpenses();
  }, [fetchOperationExpenses]);

  const handleDeleteExpense = async () => {
    const token = Cookies.get("access_token");
    try {
      await axios.delete("http://34.44.189.201/delete-expense-items", {
        data: {
          each_expense_ids: [{ each_expense_id: expenseToDelete.id }],
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      fetchOperationExpenses(); // Refresh the list
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = (records) => {
    let itemsToSort = [...records];

    if (sortConfig.key) {
      itemsToSort.sort((a, b) => {
        if (
          sortConfig.key === "unit_price" ||
          sortConfig.key === "total_price" ||
          sortConfig.key === "qty"
        ) {
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
    }

    return itemsToSort;
  };

  const filterRecords = (records) => {
    return records.filter((record) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        record.expense_name?.toLowerCase().includes(lowerCaseQuery) ||
        record.starting_location?.toLowerCase().includes(lowerCaseQuery) ||
        record.destination?.toLowerCase().includes(lowerCaseQuery) ||
        record.delivery_date?.toString().includes(lowerCaseQuery) ||
        record.qty?.toString().includes(lowerCaseQuery) ||
        record.unit?.toLowerCase().includes(lowerCaseQuery) ||
        record.unit_price?.toString().includes(lowerCaseQuery) ||
        record.total_price?.toString().includes(lowerCaseQuery)
      );
    });
  };

  const expenseTypeTranslations = {
    material: "材料",
    fleet: "車手",
    operation: "營運",
  };

  const renderExpenseType = (expenseType) => {
    return expenseTypeTranslations[expenseType] || expenseType;
  };

  const renderTableHeaders = (expenseType) => {
    return (
      <>
        <th
          className="px-4 min-w-[200px] py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10"
          onClick={() => requestSort("expense_name")}
          style={{ width: columnWidths.expense_name }}
        >
          <div className="flex items-center">
            費用名稱
            {sortConfig.key === "expense_name" && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </th>
        {expenseType !== "operation" && (
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
            起點
          </th>
        )}
        <th
          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
          style={{ width: columnWidths.destination }}
        >
          終點
        </th>
        <th
          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10"
          onClick={() => requestSort("delivery_date")}
          style={{ width: columnWidths.delivery_date }}
        >
          <div className="flex items-center justify-center">
            交貨日期
            {sortConfig.key === "delivery_date" && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </th>

        <th
          className="px-4 min-w-[80px] py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10"
          onClick={() => requestSort("qty")}
          style={{ width: columnWidths.qty }}
        >
          <div className="flex items-center justify-center">
            數量
            {sortConfig.key === "qty" && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </th>
        <th
          className="px-4 min-w-[80px] py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
          style={{ width: columnWidths.unit }}
        >
          單位
        </th>
        <th
          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10"
          onClick={() => requestSort("unit_price")}
          style={{ width: columnWidths.unit_price }}
        >
          <div className="flex items-center justify-center">
            單價
            {sortConfig.key === "unit_price" && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </th>
        <th
          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 sticky top-0 bg-gray-50 z-10"
          onClick={() => requestSort("total_price")}
          style={{ width: columnWidths.total_price }}
        >
          <div className="flex items-center justify-center">
            總價
            {sortConfig.key === "total_price" && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </th>
        <th
          className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
          style={{ width: columnWidths.actions }}
        ></th>
      </>
    );
  };

  const renderTableRows = (expenseType, record) => {
    return (
      <>
        <td
          className="px-4 min-w-[200px] py-4 whitespace-nowrap text-sm text-gray-900"
          style={{ width: columnWidths.expense_name }}
        >
          {record.expense_name}
        </td>
        {expenseType !== "operation" && (
          <td
            className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900"
            style={{ width: columnWidths.starting_location }}
          >
            {record.starting_location}
          </td>
        )}
        <td
          className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900"
          style={{ width: columnWidths.destination }}
        >
          {record.destination}
        </td>
        <td
          className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900"
          style={{ width: columnWidths.delivery_date }}
        >
          {record.delivery_date}
        </td>
        <td
          className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900"
          style={{ width: columnWidths.qty }}
        >
          {record.qty}
        </td>
        <td
          className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900"
          style={{ width: columnWidths.unit }}
        >
          {record.unit}
        </td>
        <td
          className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900"
          style={{ width: columnWidths.unit_price }}
        >
          {record.unit_price}
        </td>
        <td
          className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900"
          style={{ width: columnWidths.total_price }}
        >
          {record.total_price}
        </td>
        <td
          className="px-4 py-4 text-center relative"
          style={{ width: columnWidths.actions }}
        >
          <button
            onClick={(e) =>
              setOpenDropdownId(
                openDropdownId === record.each_expense_id
                  ? null
                  : record.each_expense_id
              )
            }
          >
            <SlOptionsVertical className="text-gray-600 hover:text-black" />
          </button>
          {openDropdownId === record.each_expense_id && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  setSelectedExpense({
                    each_expense_id: record.each_expense_id,
                    expense_name: record.expense_name,
                    unit_price: record.unit_price,
                  });
                  setIsEditModalOpen(true);
                  setOpenDropdownId(null);
                }}
              >
                編輯
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-100"
                onClick={() => {
                  setExpenseToDelete({
                    id: record.each_expense_id,
                    name: record.expense_name,
                  });
                  setIsDeleteModalOpen(true);
                  setOpenDropdownId(null);
                }}
              >
                刪除
              </button>
            </div>
          )}
        </td>
      </>
    );
  };

  const filteredGroupedExpenses = groupedExpenses
    .filter((group) => {
      // Apply type filter
      if (activeFilter !== "all" && group.expense_type !== activeFilter) {
        return false;
      }
      // Check if any records in the group match the search query
      return group.data.some(
        (supplier) => filterRecords(supplier.records).length > 0
      );
    })
    .map((group) => ({
      ...group,
      data: group.data
        .map((supplier) => ({
          ...supplier,
          records: filterRecords(supplier.records),
        }))
        .filter((supplier) => supplier.records.length > 0),
    }))
    .sort((a, b) => {
      const order = ["material", "fleet", "operation"];
      return order.indexOf(a.expense_type) - order.indexOf(b.expense_type);
    });

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      <div className="flex items-center justify-center relative my-6">
        <button
          onClick={() => navigate("/")}
          className="absolute left-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm"
        >
          <IoMdArrowBack className="size-[20px]" />
        </button>
        <h1 className="text-center font-bold text-[25px]">營運成本</h1>
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

        {/* Filter buttons */}
        <div className="flex mt-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 text-[13px] sm:text-[16px] mx-1 rounded-lg ${
              activeFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setActiveFilter("material")}
            className={`px-4 py-2 text-[13px] sm:text-[16px] mx-1 rounded-lg ${
              activeFilter === "material"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            材料
          </button>
          <button
            onClick={() => setActiveFilter("fleet")}
            className={`px-4 py-2 text-[13px] sm:text-[16px] mx-1 rounded-lg ${
              activeFilter === "fleet"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            車手
          </button>
          <button
            onClick={() => setActiveFilter("operation")}
            className={`px-4 py-2 text-[13px] sm:text-[16px] mx-1 rounded-lg ${
              activeFilter === "operation"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            營運
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <ClipLoader color="#3B82F6" loading={loading} size={50} />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[70vh]">
            <div className="max-h-[70vh] overflow-y-auto">
              {filteredGroupedExpenses.map((group) => (
                <div key={group.expense_type} className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 p-4 bg-gray-100 rounded-t-lg">
                    {renderExpenseType(group.expense_type)}
                  </h2>
                  {group.data.map((supplier) => (
                    <div key={supplier.expense_supplier} className="mb-4">
                      <h3 className="text-md font-medium text-gray-700 px-4 py-2">
                        {supplier.expense_supplier}
                      </h3>
                      <div className="overflow-x-auto relative">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>{renderTableHeaders(group.expense_type)}</tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getSortedItems(supplier.records).map((record) => (
                              <tr
                                key={record.each_expense_id}
                                className="hover:bg-gray-50"
                              >
                                {renderTableRows(group.expense_type, record)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedExpense && (
        <EditProjectExpenseModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          expense={selectedExpense}
          onSuccess={fetchOperationExpenses}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          productName={expenseToDelete.name}
          onConfirm={handleDeleteExpense}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectExpense;
