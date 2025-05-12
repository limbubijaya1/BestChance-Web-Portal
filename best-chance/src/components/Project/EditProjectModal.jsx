import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";

const EditProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const [formData, setFormData] = useState({
    project_contact: "",
    district: "",
    street_address: "",
    building: "",
  });
  const [errors, setErrors] = useState({});
  const [originalFormData, setOriginalFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    if (isOpen && project) {
      const initialData = {
        project_contact: project.contact || "",
        district: project.project_location?.district || "",
        street_address: project.project_location?.street_address || "",
        building: project.project_location?.building || "",
      };
      setFormData(initialData);
      setOriginalFormData(initialData);
      setErrors({});
      setGlobalError("");
    }
  }, [isOpen, project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear field-specific error
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.project_contact.trim())
      newErrors.project_contact = "請輸入聯絡人";
    if (!formData.district.trim()) newErrors.district = "請輸入地區";
    if (!formData.street_address.trim())
      newErrors.street_address = "請輸入街道地址";
    if (!formData.building.trim()) newErrors.building = "請輸入大廈名稱";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const hasChanges = Object.keys(formData).some(
      (key) => formData[key] !== originalFormData[key]
    );
    if (!hasChanges) {
      setGlobalError("沒有更改內容");
      return;
    }

    setIsSubmitting(true);
    const token = Cookies.get("access_token");

    try {
      const response = await axios.patch(
        `https://bestchance-accounting-cui.virpluz.io/update-project/${project.project_no}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200) {
        onSuccess("項目已成功更新");
        resetForm();
        onClose();
      }
    } catch (err) {
      let errorMessage = "更新唔到個項目，請遲啲再試";
      if (err.response) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.request) {
        errorMessage = "無法連接到伺服器，請檢查網絡連接";
      } else {
        errorMessage = err.message || errorMessage;
      }
      setGlobalError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !project) return null;

  const placeholders = {
    project_contact: "例如：陳生 / 陳小姐",
    district: "例如：荃灣",
    street_address: "例如：青山公路388號",
    building: "例如：美麗大廈",
  };

  const labels = {
    project_contact: "聯絡人",
    district: "地區",
    street_address: "街道地址",
    building: "大廈名稱",
  };

  const resetForm = () => {
    setFormData({
      project_contact: "",
      district: "",
      street_address: "",
      building: "",
    });
    setErrors({});
    setGlobalError("");
    setOriginalFormData(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90vw] sm:w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 justify-center flex">編輯項目</h2>
        <form onSubmit={handleSubmit}>
          {Object.keys(formData).map((field) => (
            <div className="mb-4" key={field}>
              <label className="block text-gray-700 mb-2">
                {labels[field]}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={placeholders[field]}
                className={`w-full p-2 border ${
                  errors[field] ? "border-red-500" : "border-gray-300"
                } rounded`}
              />
              {errors[field] && (
                <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
              )}
            </div>
          ))}

          {globalError && (
            <p className="text-red-500 text-sm mb-4 text-center">
              {globalError}
            </p>
          )}

          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <ClipLoader color="#ffffff" size={20} className="mr-2" />
              )}
              確認
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
