import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">

       <div className="brand">
          <span className="brand-logo">🚛</span>

          <div>
            <h2 style={{ color: "#ffffff" }}>Jerry's Bins</h2>
            <p>Admin Dashboard</p>
          </div>
        </div>

      <Link to="/dashboard">Dashboard</Link>
      <Link to="/calendar">Calendar</Link>
      <Link to="/customers">Customers</Link>

      <Link to="/bookings">Bookings</Link>

      <Link to="/bins">Bins</Link>

      <Link to="/waste-types">
        Waste Types
      </Link>

      <Link to="/hire-pricing">
        Hire Pricing
      </Link>

      <Link to="/distance-charges">
        Distance Charges
      </Link>

      <Link to="/admin/commercial">Commercial Quotes</Link>

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