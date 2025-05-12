import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AddMaterialModal = ({ visible, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({ ...initialData });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State for errors

  const labelMap = {
    material_name: "材料名稱",
    supplier_name: "供應商名稱",
    unit: "單位",
    unit_price: "單價",
  };

  const placeholderMap = {
    material_name: "請輸入材料名稱",
    supplier_name: "自動填入供應商名稱",
    unit: "請輸入單位，例如：公斤、包、桶",
    unit_price: "請輸入單價（例如:100）",
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const token = Cookies.get("access_token");
    setLoading(true);

    // Validation for each field
    const newErrors = {};
    if (!formData.material_name) {
      newErrors.material_name = "材料名稱不能為空";
    }
    if (!formData.unit) {
      newErrors.unit = "單位不能為空";
    }
    if (!formData.unit_price?.toString().trim()) {
      newErrors.unit_price = "單價不能為空";
    } else if (isNaN(formData.unit_price)) {
      newErrors.unit_price = "單價必須為數字";
    } else if (formData.unit_price <= 0) {
      newErrors.unit_price = "單價唔可以小於或等於零";
    }

    // If any errors exist, prevent submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      unit_price: formData.unit_price?.toString() || "0",
    };

    try {
      const response = await axios.post(
        "https://bestchance-accounting-cui.virpluz.io/add-material",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (response.status === 200) {
        onSuccess(); // refresh the list in parent
        onClose(); // close modal
      }
    } catch (error) {
      console.error("Failed to add material:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-[90vw] sm:w-[500px] h-[500px] flex justify-center flex-col">
        <h2 className="text-xl font-bold mb-4 text-center">新增材料</h2>
        <div className="grid gap-3">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-medium mb-2">
                {labelMap[key]}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholderMap[key]}
                readOnly={key === "supplier_name"}
                className={`border px-3 py-2 rounded-md ${
                  key === "supplier_name" ? "bg-gray-100 text-gray-600" : ""
                }`}
              />
              {/* Display specific error message if it exists for this field */}
              {errors[key] && (
                <span className="text-red-500 text-sm mt-1">{errors[key]}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "新增中..." : "確定"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMaterialModal;
