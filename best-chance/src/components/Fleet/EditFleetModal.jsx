import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";

const EditFleetModal = ({
  currentEdit,
  setCurrentEdit,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);
  const [noChangesError, setNoChangesError] = useState(false);
  const [success, setSuccess] = useState(false); // State for success modal
  const [error, setError] = useState(null); // State for error modal

  useEffect(() => {
    if (currentEdit) {
      setOriginalData(structuredClone(currentEdit)); // This becomes the editable form state
    }
  }, [currentEdit]);

  if (!currentEdit) return null;

  const validateForm = () => {
    const newErrors = {};
    if (!originalData.name?.trim()) {
      newErrors.name = "姓名不能為空";
    }
    if (!originalData.mobile?.trim()) {
      newErrors.mobile = "電話不能為空";
    } else if (!/^\d{8}$/.test(originalData.mobile.trim())) {
      newErrors.mobile = "電話必須為8位數字";
    }

    if (!originalData.driving_plate?.trim()) {
      newErrors.driving_plate = "車牌號碼不能為空";
    }
    if (!originalData.unit_price?.toString().trim()) {
      newErrors.unit_price = "單價不能為空";
    } else if (isNaN(originalData.unit_price)) {
      newErrors.unit_price = "單價必須為數字";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkForChanges = () => {
    if (!originalData || !currentEdit) return false;

    return (
      originalData.name !== currentEdit.name ||
      originalData.company !== currentEdit.company ||
      originalData.mobile !== currentEdit.mobile ||
      originalData.driving_plate !== currentEdit.driving_plate ||
      originalData.unit_price !== currentEdit.unit_price
    );
  };

  const handleUpdate = async () => {
    setNoChangesError(false);
    setSuccess(false);
    setError(null);
    setLoading(true);

    // If there are no changes, show error
    if (!checkForChanges()) {
      setNoChangesError(true);
      setLoading(false);
      return;
    }

    // If form is invalid, stop
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get("access_token");
      const fleetData = {
        driver_name: originalData.name,
        company: originalData.company || "",
        driver_mobile: originalData.mobile,
        driving_plate: originalData.driving_plate,
        unit_price: originalData.unit_price,
      };

      await axios.patch(
        `https://bestchance-accounting-cui.virpluz.io/update-fleet/${currentEdit.id}`,
        fleetData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setSuccess(true); // Show success modal
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("更新失敗：", err);
      setError("更新失敗，請稍後再試"); // Set error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[90vw] max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">編輯車輛</h2>

        <div className="flex flex-col gap-4">
          {[
            { label: "姓名", key: "name", placeholder: "姓名" },
            { label: "公司", key: "company", placeholder: "公司" },
            { label: "電話", key: "mobile", placeholder: "電話" },
            {
              label: "車牌號碼",
              key: "driving_plate",
              placeholder: "車牌號碼",
            },
            { label: "單價 (HKD)", key: "unit_price", placeholder: "單價" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block mb-2">{label}</label>
              <input
                value={originalData?.[key] || ""}
                onChange={(e) =>
                  setOriginalData({ ...originalData, [key]: e.target.value })
                }
                className={`border p-2 rounded w-full ${
                  errors[key] ? "border-red-500" : ""
                }`}
                placeholder={placeholder}
              />
              {errors[key] && (
                <div className="text-red-500 text-sm mt-1">{errors[key]}</div>
              )}
            </div>
          ))}
          {noChangesError && (
            <div className="text-red-500 text-center">請先進行更改後再提交</div>
          )}
          {errors.submit && (
            <div className="text-red-500 text-center">{errors.submit}</div>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? "更新中..." : "確定"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdCheckmark className="text-green-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">更新成功!</h2>
            <p className="text-gray-700">將在2秒後關閉...</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdClose className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">更新失敗!</h2>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditFleetModal;
