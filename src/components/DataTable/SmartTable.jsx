import React, { useState, useMemo } from 'react';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import { FiDownload } from 'react-icons/fi';

const SmartTable = ({ data, columns }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: '' }), {})
  );
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [applyDateFilter, setApplyDateFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const handleSort = (columnKey) => {
    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters((prevFilters) => ({
      ...prevFilters,
      [columnKey]: value,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDateRangeChange = (key, value) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  const applyDateRangeFilter = () => {
    setApplyDateFilter(true);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const csvRows = [];
    
    // Add column headers
    const headers = columns.map((col) => col.label);
    csvRows.push(headers.join(','));
  
    // Add data rows
    paginatedData.forEach((row) => {
      const values = columns.map((col) => {
        let cellValue = row[col.key];
  
        // Handle objects or rendered components
        if (col.render) {
          const renderedElement = col.render(row);
          if (typeof renderedElement === 'object' && renderedElement.props) {
            cellValue = renderedElement.props.children;
          }
        }
  
      
        // Convert undefined or null to an empty string
        if (cellValue == null) cellValue = '';
  
        // Escape quotes and commas in CSV
        return `"${String(cellValue).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
      console.log(csvRows);
    });
  
    // Create and download CSV file
    // const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = 'table_data.csv';
    // link.click();
  };
  
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (globalSearchQuery) {
        const matchesGlobalSearch = Object.values(row).some((val) => {
          const valueToCheck =
            typeof val === 'object' ? JSON.stringify(val) : String(val);
          return valueToCheck.toLowerCase().includes(globalSearchQuery.toLowerCase());
        });
        if (!matchesGlobalSearch) return false;
      }

      if (applyDateFilter && (dateRange.start || dateRange.end)) {
        const rowDate = new Date(row.created_at);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;

        if (startDate && rowDate < startDate) return false;
        if (endDate && rowDate > endDate) return false;
      }

      return columns.every((col) => {
        const filterValue = columnFilters[col.key];
        if (!filterValue) return true;

        let cellValue = row[col.key];
        if (col.render) {
          const renderedElement = col.render(row);
          console.log(renderedElement);
          if (typeof renderedElement === 'object' && renderedElement.props) {
            cellValue = renderedElement.props.children;
          }
        }
       // return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, globalSearchQuery, columnFilters, dateRange, columns, applyDateFilter]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '';
    return sortConfig.direction === 'asc' ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />;
  };

  return (
    <div className="overflow-x-auto bg-white border rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-between items-center p-3 space-x-4">
        <input
          type="text"
          placeholder="Global Search..."
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        />
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            className="border border-gray-300 rounded-md p-2"
          />
          <button
            onClick={applyDateRangeFilter}
            className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none"
          >
            Filter
          </button>
          <button
            onClick={exportToCSV}
            className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600 focus:outline-none flex items-center"
          >
            <FiDownload className="mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      <table className="min-w-full text-left">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="cursor-pointer px-4 py-2 text-gray-600 font-medium dark:text-gray-300"
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {renderSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 pb-3">
                <input
                  type="text"
                  value={columnFilters[col.key]}
                  onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}
                  className="border border-gray-300 rounded-md p-1 w-full"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index} className="border-b dark:border-gray-700">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {col.render ? col.render(row, index) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center items-center p-4">
        <nav>
          <ul className="inline-flex space-x-2">
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page}>
                <button
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded ${
                  currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SmartTable;
