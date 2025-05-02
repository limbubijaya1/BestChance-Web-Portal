import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ClipLoader } from "react-spinners";
import { useNavigate, useParams } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { FiSearch, FiPlus } from "react-icons/fi";

const ProjectExpense = () => {
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const navigate = useNavigate();
  const { projectID } = useParams();

  const fetchOperationExpenses = useCallback(async () => {
    const token = Cookies.get("access_token");
    setLoading(true);
    try {
      const response = await axios.get(
        `http://34.44.189.201/read-project-expenses/${projectID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setGroupedExpenses(response.data.grouped_expenses);
    } catch (error) {
      console.error("Error fetching operation expenses:", error);
      setGroupedExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [projectID]);

  useEffect(() => {
    fetchOperationExpenses();
  }, [fetchOperationExpenses]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = (records) => {
    let itemsToSort = [...records];

    if (sortConfig.key) {
      itemsToSort.sort((a, b) => {
        if (
          sortConfig.key === "unit_price" ||
          sortConfig.key === "total_price"
        ) {
          const aVal = parseFloat(a[sortConfig.key]) || 0;
          const bVal = parseFloat(b[sortConfig.key]) || 0;
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        } else {
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
    }

    return itemsToSort;
  };

  const filterRecords = (records) => {
    return records.filter(
      (record) =>
        record.expense_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.unit_price.toString().includes(searchQuery) ||
        record.total_price.toString().includes(searchQuery)
    );
  };

  const renderTableHeaders = (expenseType) => {
    const baseHeaders = (
      <>
        <th
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => requestSort("expense_name")}
        >
          <div className="flex items-center">
            費用名稱
            {sortConfig.key === "expense_name" && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </th>
        <th
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => requestSort("unit_price")}
        >
          <div className="flex items-center">
            單價
            {sortConfig.key === "unit_price" && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </th>
        <th
          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
          onClick={() => requestSort("total_price")}
        >
          <div className="flex items-center">
            總價
            {sortConfig.key === "total_price" && (
              <span className="ml-1">
                {sortConfig.direction === "asc" ? "↑" : "↓"}
              </span>
            )}
          </div>
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          數量
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          單位
        </th>
      </>
    );

    switch (expenseType) {
      case "fleet":
        return (
          <>
            {baseHeaders}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              起點
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              終點
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              交貨日期
            </th>
          </>
        );
      case "material":
        return (
          <>
            {baseHeaders}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              終點
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              交貨日期
            </th>
          </>
        );
      case "operation":
        return (
          <>
            {baseHeaders}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              終點
            </th>
          </>
        );
      default:
        return baseHeaders;
    }
  };

  const renderTableRows = (expenseType, record) => {
    switch (expenseType) {
      case "fleet":
        return (
          <>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.expense_name}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">{record.unit_price}</td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.total_price}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">{record.qty}</td>
            <td className="px-4 py-4 whitespace-nowrap">{record.unit}</td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.starting_location}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.destination}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.delivery_date}
            </td>
          </>
        );
      case "material":
        return (
          <>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.expense_name}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">{record.unit_price}</td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.total_price}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">{record.qty}</td>
            <td className="px-4 py-4 whitespace-nowrap">{record.unit}</td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.destination}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.delivery_date}
            </td>
          </>
        );
      case "operation":
        return (
          <>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.expense_name}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">{record.unit_price}</td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.total_price}
            </td>
            <td className="px-4 py-4 whitespace-nowrap">{record.qty}</td>
            <td className="px-4 py-4 whitespace-nowrap">{record.unit}</td>
            <td className="px-4 py-4 whitespace-nowrap">
              {record.destination}
            </td>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 min-h-[calc(100vh-120px)] bg-gray-100 rounded-lg flex flex-col">
      {/* Header with back button and centered title */}
      <div className="flex items-center justify-center relative my-6">
        <button
          onClick={() => navigate("/")}
          className="absolute left-0 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-sm"
        >
          <IoMdArrowBack className="size-[20px]" />
        </button>
        <h1 className="text-center font-bold text-[25px]">營運成本</h1>
      </div>

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
          <ClipLoader color="#3B82F6" loading={loading} size={50} />
        </div>
      ) : (
        <>
          {groupedExpenses.map((group) => (
            <div key={group.expense_type} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {group.expense_type}
              </h2>
              {group.data.map((supplier) => (
                <div key={supplier.expense_supplier} className="mb-4">
                  <h3 className="text-lg font-medium mb-2">
                    {supplier.expense_supplier}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>{renderTableHeaders(group.expense_type)}</tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getSortedItems(filterRecords(supplier.records)).map(
                          (record) => (
                            <tr key={record.each_expense_id}>
                              {renderTableRows(group.expense_type, record)}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ProjectExpense;
