import React from "react";
import { Bell, User } from "lucide-react";

const Navbar = () => {
  return (
    <div className="navbar">
      <div>
        <h2>Jerry's Bins</h2>
      </div>

      <div className="nav-right">
        <Bell size={20} />
        <User size={20} />
      </div>
    </div>
  );
};

export default Navbar;