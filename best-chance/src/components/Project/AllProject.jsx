import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { SlOptionsVertical } from "react-icons/sl";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import AddProjectModal from "./AddProjectModal";
import EditProjectModal from "./EditProjectModal";

const AllProject = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    field: "projectNo",
    direction: "asc",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [editFormData, setEditFormData] = useState({
    project_contact: "",
    district: "",
    street_address: "",
    building: "",
  });
  const [originalFormData, setOriginalFormData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // New state for loading indicator
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProject = async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        "http://34.44.189.201/read-all-projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const sortedData = response.data.all_projects.sort((a, b) =>
        a.project_no.localeCompare(b.project_no)
      );
      setItems(sortedData);
    } catch (error) {
      console.error("Error fetching projects:", error);
      let errorMessage = "獲取項目失敗，請稍後再試";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "無法連接到伺服器，請檢查網絡連接";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    console.log(projectId.project_no);
    const token = Cookies.get("access_token");
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `http://34.44.189.201/delete-project-only/${projectId.project_no}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      console.log(response.data);

      if (response.status === 200) {
        await fetchProject();
        setSuccess("所選項目已經成功刪除");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      let errorMessage = "刪除項目失敗，請遲啲再試";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "無法連接到伺服器，請檢查網絡連接";
      }
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddSuccess = (message) => {
    setSuccess(message);
    fetchProject(); // Refetch projects after adding a new one
  };

  useEffect(() => {
    fetchProject();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const sortItems = (items) => {
    if (!sortConfig.field) return items;

    const sortedItems = [...items].sort((a, b) => {
      if (sortConfig.field === "date") {
        return new Date(a.start_date) - new Date(b.start_date);
      } else if (sortConfig.field === "projectNo") {
        return a.project_no.localeCompare(b.project_no);
      } else if (sortConfig.field === "contact") {
        return a.contact.localeCompare(b.contact);
      }
      return 0;
    });

    return sortConfig.direction === "asc" ? sortedItems : sortedItems.reverse();
  };

  const filteredItems = searchQuery
    ? items.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.project_no.toString().includes(query) ||
          item.contact.toLowerCase().includes(query) ||
          item.start_date.includes(query) ||
          item.project_location.district?.toLowerCase().includes(query) ||
          item.project_location.street_address?.toLowerCase().includes(query) ||
          item.project_location.building?.toLowerCase().includes(query)
        );
      })
    : items;

  const sortedAndFilteredItems = sortItems(filteredItems);

  const handleSort = (field) => {
    let direction = "asc";
    if (sortConfig.field === field && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ field, direction });
    setIsDropdownOpen(false);
  };

  const handleCardClick = (projectId) => {
    navigate(`/order/${projectId}`);
  };

  const toggleOptionsMenu = (projectId, e) => {
    e.stopPropagation();
    setActiveProjectId(activeProjectId === projectId ? null : projectId);
  };

  const handleEdit = (project, e) => {
    e.stopPropagation();
    setCurrentProject(project);
    const initialData = {
      project_contact: project.contact,
      district: project.project_location.district,
      street_address: project.project_location.street_address,
      building: project.project_location.building,
    };
    setEditFormData(initialData);
    setOriginalFormData(initialData);
    setIsEditModalOpen(true);
    setActiveProjectId(null);
  };

  const dropdownOptions = [
    { type: "sort", field: "projectNo", label: "工程編號" },
    { type: "sort", field: "contact", label: "聯絡人" },
    { type: "sort", field: "date", label: "開始日期" },
  ];

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      <h1 className="text-center font-bold my-6 text-[25px]">所有項目</h1>
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

        <div className="flex justify-end w-full sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] items-center mx-auto relative px-4 sm:px-0 pt-2">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-[40px] px-4 text-black rounded-[30px] flex items-center justify-center whitespace-nowrap border shadow-sm "
          >
            {`排序: ${
              sortConfig.field === "date"
                ? "開始日期"
                : sortConfig.field === "projectNo"
                ? "工程編號"
                : "聯絡人"
            } ${sortConfig.direction === "asc" ? "↑" : "↓"}`}
            <svg
              className={`ml-2 w-4 h-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
              {dropdownOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSort(option.field)}
                  className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${
                    sortConfig.field === option.field
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                  {sortConfig.field === option.field && (
                    <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <ClipLoader color="#000" loading={loading} size={50} />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full px-4 sm:px-0 sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[60vh] overflow-y-auto">
            {sortedAndFilteredItems.map((item) => (
              <div
                key={item.project_no}
                className="border border-gray-300 p-4 rounded-md shadow-md bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer relative"
                onClick={() => handleCardClick(item.project_no)}
              >
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => toggleOptionsMenu(item.project_no, e)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <SlOptionsVertical className="text-gray-500" />
                  </button>

                  {activeProjectId === item.project_no && (
                    <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
                      <button
                        onClick={(e) => handleEdit(item, e)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        編輯
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(item);
                          setShowDeleteModal(true);
                          setActiveProjectId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        刪除
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-1 truncate pr-6">
                  <span>工程地點:</span>{" "}
                  {`${item.project_location.district}, ${item.project_location.street_address}, ${item.project_location.building}`}
                </h3>
                <p className="text-gray-600 mb-1">
                  工程編號: {item.project_no}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">聯絡人:</span> {item.contact}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">開始日期:</span>{" "}
                  {item.start_date}
                </p>
              </div>
            ))}
            {/* Add Project Button */}
            <div
              className="border border-gray-300 p-4 rounded-md shadow-md bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer flex items-center justify-center min-h-[120px]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <span className="text-2xl font-bold">+</span>
            </div>
          </div>
        </div>
      )}

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={currentProject}
        onSuccess={(msg) => {
          setSuccess(msg);
          fetchProject();
        }}
      />

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {showDeleteModal && (
        <ConfirmDeleteModal
          productName={`工程地點: ${projectToDelete.project_location.district}, ${projectToDelete.project_location.street_address}, ${projectToDelete.project_location.building}`}
          page={"project"}
          onConfirm={() => handleDelete(projectToDelete)}
          onCancel={() => {
            setShowDeleteModal(false);
            setProjectToDelete(null);
          }}
        />
      )}

      {/* Success Popup */}
      {success && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdCheckmark className="text-green-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">操作成功!</h2>
            <p className="text-gray-700">{success}</p>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {error && error !== "沒有更改內容" && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <IoMdClose className="text-red-500 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">操作失敗!</h2>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProject;
