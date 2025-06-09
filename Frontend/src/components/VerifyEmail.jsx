import React, { useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/user/verify-email/${token}`);
        toast.success(response.data.message);
        setTimeout(() => navigate("/login"), 2000); // Redirect to login after showing toast
      } catch (error) {
        toast.error(error.response?.data.message || "Error verifying email");
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h3 className="font-bold text-2xl text-center">Email Verification</h3>
        <p className="text-center mt-4">Processing your verification...</p>
      </div>
    </div>
  );
}

export default VerifyEmail;