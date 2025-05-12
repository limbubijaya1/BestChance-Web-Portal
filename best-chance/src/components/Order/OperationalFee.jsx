import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdArrowBack, IoMdClose, IoMdCheckmark } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import EditProjectExpenseModal from "./ProjectExpense/EditProjectExpenseModal";

const OperationalFee = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showModal, setShowModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    expense_name: "",
    unit_price: "",
  });
  const [errors, setErrors] = useState({
    expense_name: "",
    unit_price: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { projectID } = useParams();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const fetchOperationExpenses = useCallback(async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        `https://bestchance-accounting-cui.virpluz.io/read-project-expenses/${projectID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const groupedExpenses = response.data.grouped_expenses;
      const operationGroup = groupedExpenses.find(
        (group) => group.expense_type === "operation"
      );

      if (operationGroup) {
        const allExpenses = operationGroup.data.flatMap((supplier) =>
          supplier.records.map((record) => ({
            ...record,
            expense_supplier: supplier.expense_supplier,
          }))
        );
        setExpenses(allExpenses);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Error fetching operation expenses:", error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [projectID]);

  const handleDeleteExpense = async () => {
    const token = Cookies.get("access_token");
    try {
      await axios.delete(
        "https://bestchance-accounting-cui.virpluz.io/delete-expense-items",
        {
          data: {
            each_expense_ids: [{ each_expense_id: expenseToDelete.id }],
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      fetchOperationExpenses(); // Refresh the list
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  useEffect(() => {
    fetchOperationExpenses();
  }, [fetchOperationExpenses]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      expense_name: "",
      unit_price: "",
    };

    if (!newExpense.expense_name.trim()) {
      newErrors.expense_name = "請輸入費用名稱";
      valid = false;
    }

    if (!newExpense.unit_price) {
      newErrors.unit_price = "請輸入價格";
      valid = false;
    } else if (isNaN(newExpense.unit_price)) {
      newErrors.unit_price = "單價必須為數字";
      valid = false;
    } else if (newExpense.unit_price <= 0) {
      newErrors.unit_price = "單價唔可以小於或等於零";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAddExpense = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const token = Cookies.get("access_token");

    try {
      await axios.post(
        `https://bestchance-accounting-cui.virpluz.io/order-operation/${projectID}`,
        {
          expense_name: newExpense.expense_name,
          unit_price: newExpense.unit_price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      await fetchOperationExpenses();
      setShowModal(false);
      setNewExpense({
        expense_name: "",
        unit_price: "",
      });
      setSuccess(true);
    } catch (error) {
      console.error("Error adding expense:", error);
      setError("新增費用失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSortedItems = () => {
    let itemsToSort = [...expenses];

    if (searchQuery) {
      itemsToSort = itemsToSort.filter(
        (expense) =>
          expense.expense_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          expense.unit_price.toString().includes(searchQuery)
      );
    }

    if (sortConfig.key) {
      itemsToSort.sort((a, b) => {
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
    }

    return itemsToSort;
  };

  const sortedItems = getSortedItems();

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
        <h1 className="text-center font-bold text-[25px]">營運費用</h1>
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
          {/* Scrollable Operation Expenses table */}
          <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-md overflow-hidden w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[60vh]">
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("expense_name")}
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
                      <th
                        className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] whitespace-nowrap cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("unit_price")}
                      >
                        <div className="flex items-center justify-center">
                          價格 (HKD)
                          {sortConfig.key === "unit_price" && (
                            <span className="ml-1">
                              {sortConfig.direction === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] whitespace-nowrap cursor-pointer hover:bg-gray-100"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedItems.map((expense) => (
                      <tr
                        key={expense.each_expense_id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {expense.expense_name}
                        </td>
                        <td className="px-2 py-4 text-center text-sm text-gray-500 whitespace-nowrap">
                          ${expense.unit_price}
                        </td>
                        <td className="px-4 py-4 text-center relative">
                          <button
                            onClick={(e) =>
                              setOpenDropdownId(
                                openDropdownId === expense.each_expense_id
                                  ? null
                                  : expense.each_expense_id
                              )
                            }
                          >
                            <SlOptionsVertical className="text-gray-600 hover:text-black" />
                          </button>
                          {openDropdownId === expense.each_expense_id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                              <button
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedExpense({
                                    each_expense_id: expense.each_expense_id,
                                    expense_name: expense.expense_name,
                                    unit_price: expense.unit_price,
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
                                    id: expense.each_expense_id,
                                    name: expense.expense_name,
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
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Add Expense Button */}
                <div className="p-4 flex justify-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-[30px] w-[100px] justify-center"
                  >
                    新增費用
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b p-4 text-center">
              <h3 className="text-lg font-semibold">新增營運費用</h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    費用名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newExpense.expense_name}
                    onChange={(e) => {
                      setNewExpense({
                        ...newExpense,
                        expense_name: e.target.value,
                      });
                      setErrors({ ...errors, expense_name: "" });
                    }}
                    className={`w-full px-3 py-2 border ${
                      errors.expense_name ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="輸入費用名稱，例如公證費、垃圾處理費"
                  />
                  {errors.expense_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.expense_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    價格 (HKD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newExpense.unit_price}
                    onChange={(e) => {
                      setNewExpense({
                        ...newExpense,
                        unit_price: e.target.value,
                      });
                      setErrors({ ...errors, unit_price: "" });
                    }}
                    className={`w-full px-3 py-2 border ${
                      errors.unit_price ? "border-red-500" : "border-gray-300"
                    } rounded-md focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="輸入價格，例:100.50"
                  />
                  {errors.unit_price && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.unit_price}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 p-4 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ClipLoader color="#ffffff" size={20} className="mr-2" />
                ) : null}
                確認新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {success && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdCheckmark className="text-green-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">新增成功!</h2>
            <p className="text-gray-700">費用已成功新增</p>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {error && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdClose className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">新增失敗!</h2>
            <p className="text-gray-700">{error}</p>
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

export default OperationalFee;
