import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { SlOptions } from "react-icons/sl";
import axios from "axios";
import Cookies from "js-cookie";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

const ShowSupplierInformationModal = ({
  visible,
  supplierInfo,
  onSuccess,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...supplierInfo });
  const [originalData, setOriginalData] = useState({ ...supplierInfo }); // Store original data
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [noChangesError, setNoChangesError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Reset form when supplierInfo changes
  useEffect(() => {
    setFormData({ ...supplierInfo });
    setOriginalData({ ...supplierInfo });
    setIsEditing(false);
    setErrors({});
    setNoChangesError(false);
  }, [supplierInfo]);

  if (!visible) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.company_name?.trim())
      newErrors.company_name = "公司名稱不能為空";
    if (!formData.supplier_type?.trim())
      newErrors.supplier_type = "供應商類型不能為空";
    if (!formData.mobile?.trim()) {
      newErrors.mobile = "電話不能為空";
    } else if (!/^\d{8}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "電話必須為8位數字";
    }

    // Validate locations (ensure district and street are filled)
    const locationErrors = [];
    (formData.supplier_locations || []).forEach((loc, i) => {
      const locErrors = {};
      if (!loc.location_name?.trim())
        locErrors.location_name = "請選擇地點類型";
      if (!loc.district?.trim()) locErrors.district = "請輸入地區";
      if (!loc.street?.trim()) locErrors.street = "請輸入街道";

      if (Object.keys(locErrors).length > 0) {
        locationErrors[i] = locErrors;
      }
    });

    if (locationErrors.length > 0)
      newErrors.supplier_locations = locationErrors;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLocationChange = (index, field, value) => {
    const updated = [...(formData.supplier_locations || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, supplier_locations: updated }));
  };

  const addNewLocation = () => {
    setFormData((prev) => ({
      ...prev,
      supplier_locations: [
        ...(prev.supplier_locations || []),
        { location_name: "", district: "", street: "", building: "" },
      ],
    }));
  };

  const cleanLocations = (locations) => {
    const cleaned = locations.filter((loc) => {
      const isLocationNameEmpty = !loc.location_name?.trim();
      const areAllFieldsEmpty =
        !loc.district?.trim() && !loc.street?.trim() && !loc.building?.trim();
      return !(isLocationNameEmpty && areAllFieldsEmpty);
    });

    return cleaned.length > 0 ? cleaned : null;
  };

  // Deep comparison function for objects and arrays
  const deepEqual = (a, b) => {
    if (a === b) return true;

    if (
      typeof a !== "object" ||
      a === null ||
      typeof b !== "object" ||
      b === null
    ) {
      return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;

      if (key === "supplier_locations") {
        // Special handling for locations array
        const locA = a[key] || [];
        const locB = b[key] || [];

        if (locA.length !== locB.length) return false;

        for (let i = 0; i < locA.length; i++) {
          if (!deepEqual(locA[i], locB[i])) return false;
        }
      } else if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  };

  const checkForChanges = () => {
    return !deepEqual(formData, originalData);
  };

  const handleSave = async () => {
    if (!validate()) return;

    // Check if any changes were made
    if (!checkForChanges()) {
      setNoChangesError(true);
      return;
    }

    setNoChangesError(false);
    setLoading(true);

    try {
      const token = Cookies.get("access_token");
      const cleanedLocations = cleanLocations(
        formData.supplier_locations || []
      );
      const payload = {
        ...formData,
        supplier_locations: cleanedLocations,
      };

      const response = await axios.patch(
        `http://34.44.189.201/update-supplier/${formData.supplier_id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update both form and original data after successful save
        const updatedData = {
          ...formData,
          supplier_locations: cleanedLocations,
        };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setIsEditing(false);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("更新失敗:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true); // Show the delete confirmation modal
  };

  const confirmDelete = async () => {
    try {
      const token = Cookies.get("access_token");
      await axios.delete(
        `http://34.44.189.201/delete-supplier/${formData.supplier_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      // Call onSuccess or any other function to refresh the list after deletion
      if (onSuccess) onSuccess();
      onClose(); // Close the modal after deletion
    } catch (err) {
      console.error("刪除失敗:", err);
    } finally {
      setShowDeleteModal(false); // Hide the delete confirmation modal
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] xl:w-[40vw]">
        <div className="flex justify-between items-center mb-4 relative">
          <h2 className="text-xl font-semibold text-gray-800">供應商資料</h2>
          <div className="flex items-center gap-3 relative">
            {!isEditing && (
              <button
                onClick={() => setShowOptions((prev) => !prev)}
                className="hover:text-blue-700 relative"
              >
                <SlOptions />
              </button>
            )}

            {showOptions && !isEditing && (
              <div className="absolute right-10 top-6 bg-white border shadow rounded w-24 z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setIsEditing(true);
                    setShowOptions(false);
                  }}
                >
                  編輯
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                  onClick={() => {
                    handleDelete();
                    setShowOptions(false);
                  }}
                >
                  刪除
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <IoClose size={24} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <strong>公司名稱:</strong>
            {isEditing ? (
              <>
                <input
                  className={`border px-2 py-1 rounded w-full ${
                    errors.company_name && "border-red-500"
                  }`}
                  value={formData.company_name}
                  onChange={(e) =>
                    handleInputChange("company_name", e.target.value)
                  }
                  placeholder="公司名稱"
                />
                {errors.company_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.company_name}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-700">{formData.company_name}</p>
            )}
          </div>

          <div>
            <strong>供應商類型:</strong>
            {isEditing ? (
              <>
                <input
                  className={`border px-2 py-1 rounded w-full ${
                    errors.supplier_type && "border-red-500"
                  }`}
                  value={formData.supplier_type}
                  onChange={(e) =>
                    handleInputChange("supplier_type", e.target.value)
                  }
                  placeholder="供應商類型"
                />
                {errors.supplier_type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.supplier_type}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-700">{formData.supplier_type}</p>
            )}
          </div>

          <div>
            <strong>電話:</strong>
            {isEditing ? (
              <>
                <input
                  className={`border px-2 py-1 rounded w-full ${
                    errors.mobile && "border-red-500"
                  }`}
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  placeholder="電話"
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </>
            ) : (
              <p className="text-gray-700">{formData.mobile}</p>
            )}
          </div>

          <div>
            <strong>地址:</strong>
            {isEditing ? (
              <div className="space-y-3">
                {(formData.supplier_locations || []).map((loc, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2"
                  >
                    <select
                      className="border px-2 py-1 rounded"
                      value={loc.location_name}
                      onChange={(e) =>
                        handleLocationChange(i, "location_name", e.target.value)
                      }
                    >
                      <option value="">選擇地點</option>
                      <option value="倉庫">倉庫</option>
                      <option value="碼頭">碼頭</option>
                    </select>
                    {errors.supplier_locations &&
                      errors.supplier_locations[i]?.location_name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.supplier_locations[i].location_name}
                        </p>
                      )}

                    <input
                      className="border px-2 py-1 rounded"
                      placeholder="地區"
                      value={loc.district}
                      onChange={(e) =>
                        handleLocationChange(i, "district", e.target.value)
                      }
                    />
                    {errors.supplier_locations &&
                      errors.supplier_locations[i]?.district && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.supplier_locations[i].district}
                        </p>
                      )}

                    <input
                      className="border px-2 py-1 rounded"
                      placeholder="街道"
                      value={loc.street}
                      onChange={(e) =>
                        handleLocationChange(i, "street", e.target.value)
                      }
                    />
                    {errors.supplier_locations &&
                      errors.supplier_locations[i]?.street && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.supplier_locations[i].street}
                        </p>
                      )}

                    <input
                      className="border px-2 py-1 rounded"
                      placeholder="大廈"
                      value={loc.building}
                      onChange={(e) =>
                        handleLocationChange(i, "building", e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  onClick={addNewLocation}
                  className="text-blue-500 hover:text-blue-700 mt-2"
                >
                  + 新增地址
                </button>
              </div>
            ) : formData.supplier_locations?.length > 0 ? (
              <ul className="text-gray-700">
                {formData.supplier_locations.map((l, i) => (
                  <li key={i}>
                    {l.location_name}: {l.district}, {l.street}, {l.building}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">沒有地址紀錄</p>
            )}
          </div>
        </div>

        {noChangesError && (
          <p className="text-red-500 text-center text-sm mt-2">
            請先進行更改後再提交
          </p>
        )}

        {isEditing && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => {
                setFormData({ ...supplierInfo }); // ← reset to original data
                setIsEditing(false);
                setErrors({});
                setNoChangesError(false); // Reset the error state
              }}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              取消
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading}
            >
              {loading ? "儲存中..." : "確定"}
            </button>
          </div>
        )}

        {showDeleteModal && (
          <ConfirmDeleteModal
            productName={formData.company_name}
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ShowSupplierInformationModal;
