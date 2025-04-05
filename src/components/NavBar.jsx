import React from "react";
import { Link } from "react-router-dom";
import { Home, Star, User, Search, Settings, CirclePlus } from "lucide-react"; // Bell is now imported in Notifications.js
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Import Firebase auth
import Notifications from './Notifications'; // Import the new component

const Navbar = ({ user, userRole }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Signed out successfully!");
      // Consider redirecting the user after sign out, e.g., history.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bg-[#5B4A43] p-4 sticky top-0 z-30"> {/* Added sticky and z-index */}
      <div className="flex justify-between items-center w-full px-4 sm:px-8"> {/* Adjusted padding */}
        {/* Logo/Brand Name */}
        <Link className="text-white text-2xl font-bold whitespace-nowrap" to="/"> {/* Use Link and ensure no wrap */}
           Cafinity
        </Link>

        {/* Right side icons/links */}
        {/* Use a div that allows wrapping on smaller screens if needed, but keep items centered */}
        <div className="flex items-center space-x-2 sm:space-x-4"> {/* Added spacing */}
          {/* Standard Links/Icons */}
          <Link to="/profile" className="m-0 p-2 rounded-full hover:bg-white/20" title="Profile"> {/* Adjusted margin/padding, added title */}
            <User color="#6490E1" size={20} />
          </Link>
          <Link to="/addcafe" className="m-0 p-2 rounded-full hover:bg-white/20" title="Add Cafe">
            <CirclePlus color="#6490E1" size={20} />
          </Link>
          <Link to="/caferecommender" className="m-0 p-2 rounded-full hover:bg-white/20" title="Search/Recommend">
            <Search color="#6490E1" size={20} />
          </Link>

          {/* Conditional Owner Link */}
          {userRole === "owner" && (
            <Link to="/owner-dashboard" className="m-0 p-2 rounded-full hover:bg-white/20" title="Owner Dashboard">
              <Settings color="#6490E1" size={20} />
            </Link>
          )}

          {/* Notifications Component */}
          {/* Render Notifications only if user is logged in */}
          {user && <Notifications />}

          {/* Auth Links/Buttons */}
          {user ? (
            <button
              onClick={handleSignOut}
              className="m-0 p-2 text-white text-sm sm:text-base hover:bg-white/20 rounded px-3" // Adjusted styling
              title="Sign Out"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/login" className="m-0 p-2 rounded-full hover:bg-white/20" title="Login/Sign Up">
                {/* Or use a Login icon */}
               <Star color="#6490E1" size={20} />
               {/* <span className="text-white text-sm sm:text-base ml-1">Login</span> */}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;