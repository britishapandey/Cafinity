import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div style={{ padding: "10px", backgroundColor: "#5B4A43" }}>
        <h1 className="text-white">Navbar</h1>
        <Link to="/" className="m-4">Home</Link>
        <Link to="/login" className="m-4">Login</Link>
        <Link to="/profile" className="m-4">Profile</Link>
    </div>
  );
};

export default Navbar;
