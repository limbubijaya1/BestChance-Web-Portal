import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AddSupplierModal = ({ visible, onClose, onSuccess }) => {
  const [supplierData, setSupplierData] = useState({
    company_name: "",
    supplier_type: "",
    mobile: "",
    location_name: "",
    district: "",
    street: "",
    building: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplierData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!supplierData.company_name.trim())
      newErrors.company_name = "請輸入公司名稱";
    if (!supplierData.supplier_type.trim())
      newErrors.supplier_type = "請輸入供應商類型";
    if (!supplierData.mobile.trim()) {
      newErrors.mobile = "請輸入聯絡電話";
    } else if (!/^\d{8}$/.test(supplierData.mobile)) {
      newErrors.mobile = "聯絡電話必須是8位數字";
    }
    if (!supplierData.location_name.trim())
      newErrors.location_name = "請選擇地點類型";
    if (!supplierData.district.trim()) newErrors.district = "請輸入地區";
    if (!supplierData.street.trim()) newErrors.street = "請輸入街道";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const token = Cookies.get("access_token");

    try {
      await axios.post(
        "http://34.44.189.201/add-supplier",
        {
          company_name: supplierData.company_name,
          supplier_type: supplierData.supplier_type,
          mobile: supplierData.mobile,
          supplier_locations: [
            {
              location_name: supplierData.location_name,
              district: supplierData.district,
              street: supplierData.street,
              building: supplierData.building,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add supplier:", error);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[90vw] max-w-[500px]">
        <h2 className="text-xl font-bold text-center mb-6">加入新供應商</h2>

        {/* Company Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">公司名稱</label>
          <input
            name="company_name"
            placeholder="請輸入公司名稱"
            className="w-full p-2 border rounded"
            value={supplierData.company_name}
            onChange={handleChange}
          />
          {errors.company_name && (
            <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>
          )}
        </div>

        {/* Supplier Type */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">供應商類型</label>
          <input
            name="supplier_type"
            placeholder="請輸入供應商類型"
            className="w-full p-2 border rounded"
            value={supplierData.supplier_type}
            onChange={handleChange}
          />
          {errors.supplier_type && (
            <p className="text-red-500 text-sm mt-1">{errors.supplier_type}</p>
          )}
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">聯絡電話</label>
          <input
            name="mobile"
            placeholder="請輸入聯絡電話"
            className="w-full p-2 border rounded"
            value={supplierData.mobile}
            onChange={handleChange}
          />
          {errors.mobile && (
            <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
          )}
        </div>

        {/* Location Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">地點類型</label>
          <select
            name="location_name"
            className="w-full p-2 border rounded"
            value={supplierData.location_name}
            onChange={handleChange}
          >
            <option value="">請選擇</option>
            <option value="倉庫">倉庫</option>
            <option value="碼頭">碼頭</option>
          </select>
          {errors.location_name && (
            <p className="text-red-500 text-sm mt-1">{errors.location_name}</p>
          )}
        </div>

        {/* District */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">地區</label>
          <input
            name="district"
            placeholder="請輸入地區"
            className="w-full p-2 border rounded"
            value={supplierData.district}
            onChange={handleChange}
          />
          {errors.district && (
            <p className="text-red-500 text-sm mt-1">{errors.district}</p>
          )}
        </div>

        {/* Street */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">街道</label>
          <input
            name="street"
            placeholder="請輸入街道"
            className="w-full p-2 border rounded"
            value={supplierData.street}
            onChange={handleChange}
          />
          {errors.street && (
            <p className="text-red-500 text-sm mt-1">{errors.street}</p>
          )}
        </div>

        {/* Building */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">大廈</label>
          <input
            name="building"
            placeholder="請輸入大廈"
            className="w-full p-2 border rounded"
            value={supplierData.building}
            onChange={handleChange}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded hover:bg-gray-100"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierModal;
