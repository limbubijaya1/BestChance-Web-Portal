import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AllProject = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    field: "projectNo", // Default to sort by 工程编号
    direction: "asc", // Default to ascending order
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

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
      // Sort the initial data by projectNo in ascending order
      const sortedData = response.data.all_projects.sort((a, b) =>
        a.project_no.localeCompare(b.project_no)
      );
      setItems(sortedData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

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
        return (
          item.project_no.toString().includes(searchQuery) ||
          item.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.project_location.district
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.start_date.includes(searchQuery)
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
    navigate(`/order/${projectId}`); // Navigate to /order with project ID
  };

  const dropdownOptions = [
    { type: "sort", field: "projectNo", label: "工程编号" },
    { type: "sort", field: "contact", label: "聯絡人" },
    { type: "sort", field: "date", label: "开始日期" },
  ];

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-[rgba(0,0,0,0.04)] rounded-[10px]">
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
                ? "开始日期"
                : sortConfig.field === "projectNo"
                ? "工程编号"
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
                  className={`block w-full text-left px-4 py-2 text-sm flex justify-between items-center ${
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
                className="border border-gray-300 p-4 rounded-md shadow-md bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer" // Added cursor-pointer
                onClick={() => handleCardClick(item.project_no)} // Add click handler
              >
                <h3 className="text-lg font-semibold mb-1 truncate">
                  <span>工程地点:</span>{" "}
                  {`${item.project_location.district}, ${item.project_location.street_address}, ${item.project_location.building}`}
                </h3>
                <p className="text-gray-600 mb-1">
                  工程编号: {item.project_no}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">聯絡人:</span> {item.contact}
                </p>
                <p className="text-gray-600 ">
                  <span className="font-medium">开始日期:</span>{" "}
                  {item.start_date}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProject;
