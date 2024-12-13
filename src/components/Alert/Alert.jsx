import React, { useEffect } from 'react';

const Alert = ({ message, type = 'success', onClose, duration = 2000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 flex items-center z-50 gap-2 transition-all max-w-xs sm:max-w-sm md:max-w-md w-auto p-3 rounded-md shadow-md 
        ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      role="alert"
    >
      <div className="flex items-center justify-center w-8 h-8 text-white border rounded-full shadow-md bg-white">
        {type === 'success' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="3"
            stroke="currentColor" 
            className="w-5 h-5 text-green-600"  
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5 text-green-600"
            strokeWidth="3"
            fill="currentColor"
          >
            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z" />
          </svg>
        )}
      </div>
      <span className="text-sm font-semibold text-white ">{message}</span>

      <button
        onClick={onClose}
        className="flex items-center justify-center w-8 h-8 ml-auto hover:bg-gray-200 focus:outline-none"
        aria-label="Close Alert"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth="3"
          stroke="currentColor"
          className="w-5 h-5 text-white"
        >
          <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z" />
        </svg>
      </button>
    </div>
  );
};

export default Alert;
