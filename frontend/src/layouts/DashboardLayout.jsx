import React from "react";

import Sidebar from "../components/Sidebar";

const DashboardLayout = ({
  children
}) => {
  return (
    <div className="layout">

      <Sidebar />

      <div className="main-content">


        <div className="page-content">
          {children}
        </div>

      </div>

    </div>
  );
};

export default DashboardLayout;