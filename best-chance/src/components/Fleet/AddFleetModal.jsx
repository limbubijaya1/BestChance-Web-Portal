import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";

const AddFleetModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    driver_name: "",
    company: "",
    driver_mobile: "",
    driving_plate: "",
    unit_price: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setValidationErrors({});

    const newErrors = {};
    if (!formData.driver_name.trim()) newErrors.driver_name = "姓名不能為空";
    if (!formData.driver_mobile.trim()) {
      newErrors.driver_mobile = "電話不能為空";
    } else if (!/^\d{8}$/.test(formData.driver_mobile.trim())) {
      newErrors.driver_mobile = "電話必須為8位數字";
    }
    if (!formData.driving_plate.trim())
      newErrors.driving_plate = "車牌號碼不能為空";

    if (!formData.unit_price.trim()) {
      newErrors.unit_price = "單價不能為空";
    } else if (isNaN(formData.unit_price)) {
      newErrors.unit_price = "單價必須為數字";
    } else if (formData.unit_price <= 0) {
      newErrors.unit_price = "單價唔可以小於或等於零";
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get("access_token");
      await axios.post("http://34.44.189.201/add-fleet", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Add fleet error:", error);
      setError("添加失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const fieldConfig = [
    { name: "driver_name", label: "姓名", placeholder: "請輸入司機姓名" },
    { name: "company", label: "公司", placeholder: "請輸入所屬公司（可留空）" },
    { name: "driver_mobile", label: "電話", placeholder: "請輸入聯絡電話" },
    { name: "driving_plate", label: "車牌號碼", placeholder: "請輸入車牌號碼" },
    {
      name: "unit_price",
      label: "單價",
      placeholder: "請輸入單價（例如:100）",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[90vw] max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">加入新車隊</h2>
        <div className="flex flex-col gap-4">
          {fieldConfig.map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block mb-1">{label}</label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`border p-2 rounded w-full ${
                  validationErrors[name] ? "border-red-500" : ""
                }`}
                type="text"
              />
              {validationErrors[name] && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors[name]}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? "添加中..." : "確定"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdCheckmark className="text-green-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">添加成功!</h2>
            <p className="text-gray-700">將在2秒後關閉...</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdClose className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">添加失敗!</h2>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFleetModal;
