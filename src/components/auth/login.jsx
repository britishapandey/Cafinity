// Updated src/components/auth/login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, signOut, sendEmailVerification } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { updateDoc } from "firebase/firestore";
import VerificationPopup from "./VerificationPopup";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
  const navigate = useNavigate();

  // Regular email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        // Show verification popup
        setShowVerificationPopup(true);
        setLoading(false); // Important: stop the loading state
        return; // Important: prevent further execution
      }
      
      // Only navigate to home if email is verified
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  // handling google's sign in provider
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordPopup(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FAF8F5]">
      {/* Original login form */}
      <h1 className="text-4xl font-bold mb-6">Welcome back to Cafinity!</h1>
      <form
        className="bg-white p-6 shadow-lg rounded-md w-80"
        onSubmit={handleEmailLogin}
      >
        <div className="flex flex-col mb-4">
          <label className="text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#B07242]"
            disabled={loading}
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="text-sm font-semibold mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-[#B07242]"
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={handleForgotPassword}
            className="text-[#B07242] text-sm text-right mt-1 hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
            style={{ border: 'none', margin: 0, padding: 0 }}
          >
            Forgot Password?
          </button>
        </div>
        {/* Center-align button */}
        <div className="flex justify-center ">
          <button
            type="submit"
            disabled={loading}
            className={`w-full m-0 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-[#B07242] hover:bg-[white]"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>


      <div className="flex items-center justify-center mt-4 gap-2">
        <hr className="w-12 border border-gray-400" /> or{" "}
        <hr className="w-12 border border-gray-400" />
      </div>
      {/* Google sign-in button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`mt-4 p-2 w-80 rounded-md text-white ${
          loading ? "bg-gray-400" : "bg-[#6490E1] hover:bg-[white]"
        }`}
      >
        Sign in with Google
      </button>

      <p className="mt-4 text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#B07242] hover:underline">
          Register here
        </Link>
      </p>
       {/* Error message */}
      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {/* Verification Popup Overlay */}
      <VerificationPopup 
        isOpen={showVerificationPopup}
        onClose={() => setShowVerificationPopup(false)}
        isRegistration={false}
      />

      {/* Forgot Password Popup */}
      {showForgotPasswordPopup && (
        <ForgotPassword 
          onClose={() => setShowForgotPasswordPopup(false)} 
        />
      )}
    </div>
  );
};

export default Login;