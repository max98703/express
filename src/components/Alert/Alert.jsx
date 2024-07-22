import React, { useEffect } from 'react';
import "./alert.css"
const Alert = ({ message, type = 'success', onClose, duration = 3000 }) => {
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
    <div className={`alert alert-${type} fixed bottom-4 text-green-800  bg-green-50 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-md  z-50`}>
      {message}
    </div>
  );
};

export default Alert;
