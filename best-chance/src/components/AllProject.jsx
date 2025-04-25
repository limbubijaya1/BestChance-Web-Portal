import React, { useEffect, useState } from "react";
import axios from "axios";

const AllProject = () => {
  const [items, setItems] = useState([]); // State to hold the project data
  const [searchQuery, setSearchQuery] = useState(""); // State for the search query

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        "http://34.44.189.201/read-all-projects"
      );
      setItems(response.data.all_projects); // Access the all_projects array
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  // Filter items based on the search query
  const filteredItems = searchQuery
    ? items.filter(
        (item) =>
          item.project_no.toString().includes(searchQuery) ||
          item.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.project_location.district
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.start_date.includes(searchQuery) // Check for start date
      )
    : items; // Show all items if searchQuery is empty

  return (
    <div className="p-4 h-[calc(100vh-120px)] bg-[rgba(0,0,0,0.04)] rounded-[10px] overflow-auto">
      <h1 className="text-center font-bold my-6 text-[25px]">所有項目</h1>
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update state on input change
          className="w-[60vw] h-[40px] p-4 border border-gray-300 rounded-[30px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-center">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-[60vw]">
          {filteredItems.map((item) => (
            <div
              key={item.project_no} // Use project_no as the key
              className="border border-gray-300 p-4 rounded-md shadow-md bg-white"
            >
              <h3 className="text-lg font-semibold">
                工程编号: {item.project_no}
              </h3>
              <p className="text-gray-600">聯絡人: {item.contact}</p>
              <p className="text-gray-600">开始日期: {item.start_date}</p>
              <p className="text-gray-600">
                工程地点: {item.project_location.district},
                {item.project_location.street_address},
                {item.project_location.building}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllProject;
