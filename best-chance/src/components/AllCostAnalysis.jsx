import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";

const AllCostAnalysis = () => {
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const fetchMonthlyReports = async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        "https://bestchance-accounting-cui.virpluz.io/read-monthly-expenses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setMonthlyReports(response.data.monthly_reports || []);
    } catch (error) {
      console.error("Error fetching monthly reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReports();
  }, []);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = [...monthlyReports]
    .filter((report) => {
      return report.expense_month
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      // Handle numeric fields
      if (sortConfig.key === "unitprice") {
        const aVal = parseFloat(a[sortConfig.key]) || 0;
        const bVal = parseFloat(b[sortConfig.key]) || 0;
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        // Handle string fields
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aVal < bVal) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      }
    });

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      <h1 className="text-center font-bold my-6 text-[25px]">成本分析</h1>
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
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <ClipLoader color="#000" loading={loading} size={50} />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="mx-auto bg-white rounded-lg shadow-md overflow-hidden w-full sm:px-0 sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-h-[60vh]">
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("expense_month")}
                    >
                      <div className="flex items-center justify-center">
                        月份
                        {sortConfig.key === "expense_month" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-center text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("total_cost")}
                    >
                      <div className="flex items-center justify-center">
                        報告連結
                        {sortConfig.key === "total_cost" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedItems.map((report) => (
                    <tr key={report.expense_month} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-center text-md text-gray-500">
                        {report.expense_month}
                      </td>

                      <td className="px-4 py-4 text-center text-md text-gray-500">
                        <a
                          href={report.monthly_report_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          查看報告
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCostAnalysis;
