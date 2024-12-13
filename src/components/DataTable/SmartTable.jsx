import React, { useState, useMemo } from 'react';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import { FiDownload, FiCalendar } from 'react-icons/fi';

const SmartTable = ({ data, columns }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: '' }), {})
  );
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [statusFilter, setStatusFilter] = useState(''); 
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

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value); // Update the status filter state
    setCurrentPage(1); // Reset pagination to the first page
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDateRangeChange = (key, value) => {
    setDateRange((prev) => {
      const newRange = { ...prev, [key]: value };
      setCurrentPage(1); // Reset to first page on date range change
      return newRange;
    });
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
  
        // Handle objects or rendered components (React components with HTML)
        if (col.render) {
          const renderedElement = col.render(row);
          
          // If the rendered element is a valid React component and has children
          if (typeof renderedElement === 'object' && renderedElement.props) {
            // Extract the text content from the rendered JSX elements
            cellValue = getTextFromReactElement(renderedElement);
          }
        }
  
        // Convert undefined or null to an empty string
        if (cellValue == null) cellValue = '';
  
        // Escape quotes and commas in CSV
        return `"${String(cellValue).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
  
    // Create and download CSV file
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table_data.csv';
    link.click();
  };
  
  // Helper function to extract text content from React components
  const getTextFromReactElement = (element) => {
    if (!element || typeof element !== 'object' || !element.props) {
      return '';
    }
  
    const { children } = element.props;
    
    // If the children are a string or array, extract the text content
    if (typeof children === 'string') {
      return children;
    }
  
    // If children are React elements, recursively extract text from them
    if (Array.isArray(children)) {
      return children.map(getTextFromReactElement).join(', ');
    }
  
    return '';
  };
  

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (globalSearchQuery) {
        const matchesGlobalSearch = columns.some((col) => {
          let valueToCheck = row[col.key];
          if (col.render) {
            const renderedElement = col.render(row);
            if (typeof renderedElement === 'object' && renderedElement.props) {
              valueToCheck = getTextFromReactElement(renderedElement);
            }
          }
          return String(valueToCheck).toLowerCase().includes(globalSearchQuery.toLowerCase());
        });
        if (!matchesGlobalSearch) return false;
      }
  
      if (dateRange.start || dateRange.end) {
        const rowDate = new Date(row.created_at);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
  
        if (startDate && rowDate < startDate) return false;
        if (endDate && rowDate > endDate) return false;
      }
  
      if (statusFilter) {
        const matchesStatusFilter = columns.some((col) => {
          let valueToCheck = row[col.key];
          if (col.render) {
            const renderedElement = col.render(row);
            if (typeof renderedElement === 'object' && renderedElement.props) {
              valueToCheck = getTextFromReactElement(renderedElement);
            }
          }
          return String(valueToCheck).toLowerCase().includes(statusFilter.toLowerCase());
        });
  
        if (!matchesStatusFilter) return false;
      }
  
      return columns.every((col) => {
        const filterValue = columnFilters[col.key];
        if (!filterValue) return true;
  
        let cellValue = row[col.key];
        if (col.render) {
          const renderedElement = col.render(row);
          if (typeof renderedElement === 'object' && renderedElement.props) {
            cellValue = getTextFromReactElement(renderedElement);
          }
        }
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, globalSearchQuery, columnFilters, dateRange, statusFilter, columns]);
  

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
    <div className="overflow-x-auto bg-white border border-blue-100 w-full  dark:bg-gray-800">
      <div className="flex justify-between items-center p-3 space-x-4">
      <div className="flex items-center space-x-3">
      {window.location.pathname === '/task' && (
    <div className="flex items-center space-x-2">
      <label className="text-gray-400 font-medium">View by:</label>
      <select
        value={statusFilter}
        onChange={handleStatusFilterChange} // Bind dropdown change
        className="border-2 border-gray-100 bg-white  rounded-full  px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Status</option>
        <option value="Assigned">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Assigned For Review">Assigned For Review</option>
        <option value="Reviewd">Reviewd</option>
        <option value="Completed">Completed</option>
        <option value="Closed">Closed</option>
      </select>
    </div>
      )}
  </div>
  
        <div className="flex items-center space-x-3 mr-3">
        <input
          type="text"
          placeholder="Global Search..."
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          className="border-2 border-gray-100 rounded-full p-2"
        />
        <p className=' text-gray-300 h-8 bg-gray-300'> | </p>
          <div className="relative">
            <FiCalendar className="cursor-pointer text-black" size={30} />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>
          <span className='text-black text-bold'>to</span>
          <div className="relative">
            <FiCalendar className="cursor-pointertext-blue-200 text-black" size={30} />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div> <p className=' text-gray-300 h-8 bg-gray-300'> | </p>
          <div className="flex items-center space-x-4">
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 text-white rounded-full hover:bg-gray-700 border-2 border-gray-100 bg-black"
          >
            <FiDownload className="mr-2 text-white" />
            Export
          </button>
        </div>
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
                <td key={col.key} className="px-4 py-3  text-xs text-gray-700 dark:text-gray-300">
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
