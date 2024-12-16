import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div style={{ padding: "10px", backgroundColor: "#f0f0f0" }}>
        <h1>Navbar</h1>
      <Link to="/" style={{ margin: "0 10px" }}>Home</Link>
      <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>
      <Link to="/profile" style={{ margin: "0 10px" }}>Profile</Link>
    </div>
  );
};

export default Navbar;
