import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { AppContext } from "../../context/AppContext";

const Otp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useContext(AppContext);

  const userDetails = location?.state?.userDetails;

  useEffect(() => {
    if (!userDetails) {
      navigate("/admin");
    }
  }, [userDetails, navigate]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (!isNaN(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    const userId = userDetails.id;

    try {
      const response = await api.post("/verify-otp", { userId, otp: otpCode });
      if (response.data.success) {
        localStorage.setItem("id_token", response.data.user);
        navigate("/user/dashboard");
        showAlert(response.data.message, "success");
      } else {
        showAlert(response?.data?.message, "error");
      }
    } catch (error) {
      showAlert(error?.response?.data?.message, "error");
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    const userId = userDetails.id;

    try {
      // Send OTP resend request to the backend
      const response = await api.post("/resend-otp", { userId });

      if (response.data.success) {
        showAlert(response.data.message, "success");
      } else {
        showAlert(response?.data?.message, "error");
      }
    } catch (error) {
      showAlert(error?.response?.data?.message, "error");
    }
  };

  return (
    userDetails && (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-sm p-6 bg-white rounded-3xl shadow-lg">
          <div className="flex flex-col items-center">
            <img
              src="https://cdn-icons-png.freepik.com/256/11191/11191097.png?semt=ais_hybrid"
              alt="OTP Verification"
              className="w-20 h-20 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800">
              OTP Verification
            </h2>
            <p className="text-sm text-gray-500 mt-2 text-center">
              We have sent an OTP to your email{" "}
              <strong>{userDetails.email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6">
            <div className="flex justify-between space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  className="w-12 h-12 text-center text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  maxLength="1"
                  inputMode="numeric"
                />
              ))}
            </div>

            <button
              type="submit"
              className="mt-6 w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Verify Account
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Didn't receive the code?</p>
            <button
              type="button"
              className="text-indigo-600 hover:underline mt-1"
              onClick={handleResend}
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Otp;
