import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../config/firebase";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create a user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (err) {
      setError("Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create a user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (err) {
      setError("Google sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FAF8F5]">
      <h1 className="text-4xl font-bold mb-6">Join the Cafinity community!</h1>
      <form
        className="bg-white p-6 shadow-lg rounded-md w-80"
        onSubmit={handleEmailRegister}
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
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`w-full m-0 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-[#B07242] hover:bg-[white]"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center mt-4 gap-2">
        <hr className="w-12 border border-gray-400" /> or{" "}
        <hr className="w-12 border border-gray-400" />
      </div>
      <button
        onClick={handleGoogleSignUp}
        disabled={loading}
        className={`mt-4 p-2 w-80 rounded-md text-white ${
          loading ? "bg-gray-400" : "bg-[#6490E1] hover:bg-[white]"
        }`}
      >
        Sign up with Google
      </button>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-[#B07242] hover:underline">
          Sign in here
        </Link>
      </p>
      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Register;
