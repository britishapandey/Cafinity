import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, sendEmailVerification } from "firebase/auth";
import { setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../../config/firebase";
import { Link, useNavigate } from "react-router-dom";
import VerificationPopup from "./VerificationPopup";

const Register = () => {
  // state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const navigate = useNavigate();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

       // Store the email that needs verification
      setVerificationEmail(email);
  
      // create profile in firestore
      const profileDocRef = doc(db, "profiles", user.uid); // Changed "users" to "profiles"
      const profileSnapshot = await getDoc(profileDocRef);
  
      if (!profileSnapshot.exists()) {
        await setDoc(profileDocRef, {
          email: user.email,
          createdAt: serverTimestamp(),
          role: "user",
          emailVerified: false // add this field to track verification status
        });
      }

      // Show verification popup instead of redirecting
      setShowVerificationPopup(true);
  
      // navigate("/");
      // Optional: You might want to redirect or not depending on your UX flow
      // navigate("/verification-pending");
    } catch (err) {
      setError(err.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      const profileDocRef = doc(db, "profiles", user.uid); // Changed "users" to "profiles"
      const profileSnapshot = await getDoc(profileDocRef);
  
      if (!profileSnapshot.exists()) {
        await setDoc(profileDocRef, {
          email: user.email,
          createdAt: serverTimestamp(),
          role: "user",
        });
      }
  
      navigate("/");
    } catch (err) {
      setError("Google sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // basic form to handle user input and registration
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#FAF8F5]">
       {/* Original registration form JSX */}
      <h1 className="text-4xl font-bold mb-6">Join the Cafinity community!</h1>
      <form className="bg-white p-6 shadow-lg rounded-md w-80" onSubmit={handleEmailRegister}>
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
            className={`w-full m-0 p-2 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-[#B07242] hover:bg-[#A06030]"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
      
      {/* Google sign-up button */}
      <div className="flex items-center justify-center mt-4 gap-2">
        <hr className="w-12 border border-gray-400" /> or <hr className="w-12 border border-gray-400" />
      </div>
      <button
        onClick={handleGoogleSignUp}
        disabled={loading}
        className={`mt-4 p-2 w-80 rounded-md text-white ${
          loading ? "bg-gray-400" : "bg-[#6490E1] hover:bg-[#507AC4]"
        }`}
      >
        Sign up with Google
      </button>

      {/* Login link */}
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-[#B07242] hover:underline">
          Sign in here
        </Link>
      </p>

      {/* Error message */}
      {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

      {/* Verification Popup Overlay */}
      <VerificationPopup 
        isOpen={showVerificationPopup}
        onClose={() => setShowVerificationPopup(false)}
        email={verificationEmail}
        isRegistration={true}
        onNavigateToLogin={() => navigate('/login')}
      />
    </div>
  );
};

export default Register;
