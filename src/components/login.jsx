import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FAF8F5]">
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
      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Login;
