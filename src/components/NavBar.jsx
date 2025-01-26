import React from "react";
import { Link } from "react-router-dom";
import { Home, Star, User, Search } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Import Firebase auth

const Navbar = ({ user }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Signed out successfully!");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bg-[#5B4A43] p-4">
      <div className="flex justify-between items-center w-full px-8">
        <h1 className="text-white text-2xl font-bold">Cafinity</h1>
        {/* Flex container for links/icons */}
        <div className="flex items-center">
          <Link to="/" className="m-4 flex items-center">
            <Home color="#6490E1" />
          </Link>
          <Link to="/profile" className="m-4 flex items-center">
            <User color="#6490E1" />
          </Link>
          <Link to="/search" className="m-4 flex items-center"> {/* New Link for SearchFilter */}
            <Search color="#6490E1" /> {/* Using Search icon */}
          </Link>
          {user ? (
            <button
              onClick={handleSignOut}
              className="m-4 text-white flex items-center"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="m-4 flex items-center">
              <Star color="#6490E1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
