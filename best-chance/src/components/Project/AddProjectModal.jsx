import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const AddProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [addFormData, setAddFormData] = useState({
    project_contact: "",
    project_company: "",
    project_location: {
      district: "",
      street_address: "",
      building: "",
    },
  });
  const [errors, setErrors] = useState({
    project_contact: "",
    project_location: {
      district: "",
      street_address: "",
      building: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    if (name in addFormData) {
      setAddFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setAddFormData((prev) => ({
        ...prev,
        project_location: {
          ...prev.project_location,
          [name]: value,
        },
      }));
    }
  };

  const validateForm = () => {
    const newErrors = { project_contact: "", project_location: {} };
    let isValid = true;

    if (!addFormData.project_contact) {
      newErrors.project_contact = "聯絡人是必填的";
      isValid = false;
    }
    if (!addFormData.project_location.district) {
      newErrors.project_location.district = "地區是必填的";
      isValid = false;
    }
    if (!addFormData.project_location.street_address) {
      newErrors.project_location.street_address = "街道地址是必填的";
      isValid = false;
    }
    if (!addFormData.project_location.building) {
      newErrors.project_location.building = "大廈名稱是必填的";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate the form
    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    const token = Cookies.get("access_token");

    try {
      const response = await axios.post(
        "http://34.44.189.201/add-project",
        addFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200) {
        onSuccess("項目已成功新增");
        onClose(); // Close modal and reset form
      }
    } catch (error) {
      let errorMessage = "加新項目失敗，遲啲再試";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage =
            "請檢查輸入資料: " +
            (error.response.data.errors
              ? Object.values(error.response.data.errors).join(", ")
              : error.response.data.message);
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "無法連接到伺服器，請檢查網絡連接";
      } else {
        errorMessage = error.message || errorMessage;
      }
      setErrors({ ...errors, form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAddFormData({
      project_contact: "",
      project_company: "",
      project_location: {
        district: "",
        street_address: "",
        building: "",
      },
    });
    setErrors({
      project_contact: "",
      project_location: {
        district: "",
        street_address: "",
        building: "",
      },
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90vw] sm:w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 flex justify-center">新增項目</h2>
        <form onSubmit={handleAddSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">聯絡人</label>
            <input
              type="text"
              name="project_contact"
              value={addFormData.project_contact}
              onChange={handleAddFormChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="請輸入聯絡人"
            />
            {errors.project_contact && (
              <p className="text-red-600 text-sm">{errors.project_contact}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">公司</label>
            <input
              type="text"
              name="project_company"
              value={addFormData.project_company}
              onChange={handleAddFormChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="選填: 公司名稱"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">地區</label>
            <input
              type="text"
              name="district"
              value={addFormData.project_location.district}
              onChange={handleAddFormChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="請輸入地區"
            />
            {errors.project_location.district && (
              <p className="text-red-600 text-sm">
                {errors.project_location.district}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">街道地址</label>
            <input
              type="text"
              name="street_address"
              value={addFormData.project_location.street_address}
              onChange={handleAddFormChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="請輸入街道地址"
            />
            {errors.project_location.street_address && (
              <p className="text-red-600 text-sm">
                {errors.project_location.street_address}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">大廈名稱</label>
            <input
              type="text"
              name="building"
              value={addFormData.project_location.building}
              onChange={handleAddFormChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="請輸入大廈名稱"
            />
            {errors.project_location.building && (
              <p className="text-red-600 text-sm">
                {errors.project_location.building}
              </p>
            )}
          </div>

          {errors.form && <p className="text-red-600 mb-4">{errors.form}</p>}

          <div className="flex justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? "提交中..." : "提交"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
