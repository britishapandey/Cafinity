import React from "react";
import { Link } from "react-router-dom";
import { Home, Star, User, Search, Settings, CirclePlus } from "lucide-react"; // Added Settings icon for admin/owner
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Import Firebase auth

const Navbar = ({ user, userRole }) => {
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
      <div className="flex justify-between items-center w-full px-8 overflow-x-scroll no-scrollbar">
        <a className="text-white text-2xl font-bold" href="/">Cafinity</a>
        {/* Flex container for links/icons */}
        <div className="flex items-center">
          <Link to="/profile" className="m-4 flex items-center">
            <User color="#6490E1" />
          </Link>
          <Link to="/search" className="m-4 flex items-center">
            <Search color="#6490E1" />
          </Link>
          <Link to="/addcafe" className="m-4 flex items-center">
            <CirclePlus color="#6490E1" />
          </Link>
          {/* Show additional options for cafe owners */}
          {userRole === "owner" && (
            <Link to="/owner-dashboard" className="m-4 flex items-center">
              <Settings color="#6490E1" /> {/* Example: Settings icon for owner dashboard */}
            </Link>
          )}
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