import React, { useState, useRef, useEffect } from "react"; // Import useState from React
import QRCode from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
const Qrcode = () => {
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const qrRef = useRef(null);
  const { Qrcode } = useAuth();

  const handleDownloadClick = async () => {
    const response = await Qrcode();
    if (response.data.success) {
      window.location.href = response.data.url;
      setQrUrl(response.data.url);
      setShowQrCode(true);
    }
  };

  const handleClickOutside = (event) => {
    if (qrRef.current && !qrRef.current.contains(event.target)) {
      setShowQrCode(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQrCode]);

  return (
    <>
      {showQrCode && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={qrRef}
            className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center"
          >
            <QRCode
              value={qrUrl} 
              size={250}
              level="H"
              includeMargin={true}
            />
            <button
              onClick={() => setShowQrCode(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div
        className="text-xs  text-gray-500 cursor-pointer"
        onClick={handleDownloadClick}
      >
        Download Login logs
      </div>
    </>
  );
};

export default Qrcode;
