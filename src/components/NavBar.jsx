import React from "react";
import { Link } from "react-router-dom";
import { Home, User, CirclePlus, Menu, ArrowRight, Store, BarChart } from "lucide-react"; // Added BarChart for admin
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase"; // Import Firebase auth
import NotificationsDropdown from "./notifications/NotificationsDropdown";

const Navbar = ({ user, userRole }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert("Signed out successfully!");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const [showSidebar, setShowSidebar] = React.useState(false);
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="bg-[#5B4A43]">
      <div className="flex justify-between items-center w-full py-4 px-8">
        <a className="text-white text-2xl font-bold" href="/">Cafinity</a>
        <div className="flex items-center">
          {user ? (
            <>
              <NotificationsDropdown userRole={userRole} />
              <button onClick={toggleSidebar} className="text-white p-2">
                <Menu />
              </button>
          </>
          ) : (
              <button className="">
                <Link to="/login" className="flex gap-2 m-0 text-white">
                  Sign In
                </Link>
              </button>
            )}
        </div>
      </div>
      {/* Sidebar */}
      {showSidebar && (
        <div className={`fixed top-0 min-w-64 max-w-96 h-full bg-[#5B4A43] text-white p-8 z-50 transition-all duration-300 right-0`}>
          <div className="w-full flex justify-end">
          <button onClick={toggleSidebar} className="text-white p-2 m-0 mb-4">
            <ArrowRight/>
          </button>
          </div>
          <ul className="">
            <li className="mb-4">
              <Link to="/" className="flex gap-2 text-white">
                <Home color="#6490E1"/> Home
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/profile" className="flex gap-2 text-white">
                <User color="#6490E1"/> Profile
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/addcafe" className="flex gap-2 text-white">
                <CirclePlus color="#6490E1"/> Add Cafe
              </Link>
            </li>
            {userRole === "owner" && (
              <li className="mb-4">
                <Link to="/business" className="flex gap-2 text-white">
                  <Store color="#6490E1"/> Owner Dashboard
                </Link>
              </li>
            )}
            {userRole === "admin" && (
              <li className="mb-4">
                <Link to="/admin" className="flex gap-2 text-white">
                  <BarChart color="#6490E1"/> Admin Panel
                </Link>
              </li>
            )}
            {user && (
              <li className="mb-4">
                <button onClick={handleSignOut} className="flex gap-2 m-0 mt-4 text-white">
                  Sign Out
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;