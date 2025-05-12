import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const EditProjectExpenseModal = ({ isOpen, onClose, expense, onSuccess }) => {
  const [expenseName, setExpenseName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (isOpen && expense) {
      setExpenseName(expense.expense_name || "");
      setUnitPrice(expense.unit_price || "");
      setErrors({});
      setGeneralError("");
    }

    if (!isOpen) {
      setExpenseName("");
      setUnitPrice("");
      setLoading(false);
      setErrors({});
      setGeneralError("");
    }
  }, [isOpen, expense]);

  const validate = () => {
    const newErrors = {};
    if (!expenseName.trim()) newErrors.expenseName = "費用名稱不能為空";
    if (!unitPrice) {
      newErrors.unitPrice = "請輸入價格";
    } else if (isNaN(unitPrice)) {
      newErrors.unitPrice = "單價必須為數字";
    } else if (unitPrice <= 0) {
      newErrors.unitPrice = "單價唔可以小於或等於零";
    }

    if (unitPrice === "" || isNaN(unitPrice))
      newErrors.unitPrice = "單價不能為空";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setGeneralError("");
    if (!validate()) return;

    // Prevent submission if nothing has changed
    if (
      expenseName.trim() === expense.expense_name &&
      parseFloat(unitPrice) === parseFloat(expense.unit_price)
    ) {
      setGeneralError("請先進行更改後再提交");
      return;
    }

    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.post(
        "https://bestchance-accounting-cui.virpluz.io/update-expense-price",
        {
          each_expense_id: expense.each_expense_id,
          expense_name: expenseName,
          new_unit_price: unitPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      setGeneralError("更新失敗，請稍後再試");
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">編輯費用</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium">費用名稱</label>
          <input
            type="text"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            className={`w-full mt-1 p-2 border rounded ${
              errors.expenseName ? "border-red-500" : ""
            }`}
          />
          {errors.expenseName && (
            <p className="text-red-500 text-sm mt-1">{errors.expenseName}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">單價</label>
          <input
            type="text"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            className={`w-full mt-1 p-2 border rounded ${
              errors.unitPrice ? "border-red-500" : ""
            }`}
            placeholder="例如：123.45"
          />
          {errors.unitPrice && (
            <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>
          )}
        </div>

        {generalError && (
          <p className="text-red-600 text-center mb-4">{generalError}</p>
        )}

        <div className="flex justify-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "儲存中..." : "確認"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectExpenseModal;
