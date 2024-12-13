import React, { useState, useRef, useEffect, useContext } from "react"; // Import useState from React
import QRCode from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
import { AppContext } from "../../context/AppContext";
const Qrcode = ({ userId }) => {
  const { showAlert } = useContext(AppContext);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const qrRef = useRef(null);
  const { Qrcode } = useAuth();

  const handleDownloadClick = async () => {
    console.log(userId);
    const response = await Qrcode(userId);
    if (response.success) {
      // window.location.href = response.url;
      setQrUrl(response.url);
      setShowQrCode(true);
    } else {
      showAlert(response.message, "error");
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
            <QRCode value={qrUrl} size={250} level="H" includeMargin={true} />
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
        class=" bg-blue-100 hover:bg-blue-300 rounded-full p-1"
        onClick={handleDownloadClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5"
        >
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path
            fill-rule="evenodd"
            d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </>
  );
};

export default Qrcode;
