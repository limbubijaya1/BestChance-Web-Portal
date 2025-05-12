import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const EditMaterialModal = ({ initialData, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ ...initialData });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const labelMap = {
    material_name: "材料名稱",
    unit: "單位",
    unit_price: "單價",
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.material_name?.trim()) {
      newErrors.material_name = "材料名稱不能為空";
    }
    if (!formData.unit?.trim()) {
      newErrors.unit = "單位不能為空";
    }
    if (!formData.unit_price?.toString().trim()) {
      newErrors.unit_price = "單價不能為空";
    } else if (isNaN(formData.unit_price)) {
      newErrors.unit_price = "單價必須為數字";
    } else if (formData.unit_price <= 0) {
      newErrors.unit_price = "單價唔可以小於或等於零";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return Object.entries(formData).some(
      ([key, value]) => value !== initialData[key]
    );
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!validateForm()) return;

    if (!hasChanges()) {
      setSubmitError("請先進行更改後再提交");
      return;
    }

    try {
      const token = Cookies.get("access_token");
      const response = await axios.patch(
        `http://34.44.189.201/update-material/${initialData.material_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (response.data.status != "error") {
        onSuccess();
      } else {
        setSubmitError("更新過程中發生錯誤，請稍後再試。");
      }
    } catch (err) {
      console.error("更新失敗：", err);
      setSubmitError("更新過程中發生錯誤，請稍後再試。");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90vw] sm:w-[500px] max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          更新材料
        </h2>

        <div className="space-y-4">
          {Object.entries(formData)
            .filter(([key]) => key !== "material_id")
            .map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labelMap[key] || key}
                </label>
                <input
                  value={value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className={`w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[key] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[key] && (
                  <p className="text-sm text-red-500 mt-1">{errors[key]}</p>
                )}
              </div>
            ))}
        </div>

        {submitError && (
          <div className="text-sm text-red-500 mt-4 text-center">
            {submitError}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMaterialModal;
