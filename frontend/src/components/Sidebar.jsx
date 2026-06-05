import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">

      <h2 className="logo">
        Jerry's Bins
      </h2>

      <Link to="/dashboard">Dashboard</Link>

      <Link to="/customers">Customers</Link>

      <Link to="/bookings">Bookings</Link>

      <Link to="/bins">Bins</Link>

      <Link to="/waste-types">
        Waste Types
      </Link>

      <Link to="/promotions">
        Promotions
      </Link>

      <Link to="/reports">
        Reports
      </Link>

    </div>
  );
};

export default Sidebar;