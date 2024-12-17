import React from "react";
import { Link } from "react-router-dom";
import { Home, Star, User } from 'lucide-react';

const Navbar = () => {
  return (
    <div className="bg-[#5B4A43] p-4">
        <div className="flex justify-between items-center w-full px-8">
            <h1 className="text-white text-2xl font-bold">Cafinity</h1>
            <div className="flex">
                <Link to="/" className="m-4"><Home color="#6490E1"/></Link>
                <Link to="/profile" className="m-4"><Star color="#6490E1"/></Link>
                <Link to="/login" className="m-4"><User color="#6490E1"/></Link>
            </div>

        </div>
    </div>
  );
};

export default Navbar;