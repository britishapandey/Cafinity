// src/components/auth/ForgotPassword.jsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import { Link } from "react-router-dom";

const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent! Please check your email inbox.");
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError(err.message || "Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#B07242]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h2 className="text-xl font-semibold mt-2">Reset Password</h2>
          <p className="text-gray-600 mt-1">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="text-center">
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-semibold mb-2">Email</label>
                <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#B07242]"
                disabled={loading}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`p-2 rounded-md text-white ${
                loading ? "bg-gray-400" : "bg-[#B07242] hover:bg-[#A06030] hover:text-white"
                }`}
            >
                {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="mt-4 text-center">
                <Link to="/login" className="text-[#B07242] hover:underline">
                Back to Login
                </Link>
            </div>
            </form>
      </div>
    </div>
  );
};

export default ForgotPassword;