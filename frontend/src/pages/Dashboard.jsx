import React,
{
  useEffect,
  useState
} from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import StartCard
from "../components/StartCard";

import api
from "../services/api";

const Dashboard = () => {

  const [stats,setStats] =
  useState({
    customers:0,
    bookings:0,
    revenue:0
  });

  useEffect(()=>{

    fetchDashboard();

  },[]);

  const fetchDashboard =
  async()=>{

    try{

      const res =
      await api.get("/dashboard");

      setStats(res.data);

    }catch(err){

      console.log(err);

    }
  };

  return (

    <DashboardLayout>

      <h1 className="page-title">
        Dashboard
      </h1>

      <div className="cards">

        <StartCard
          title="Customers"
          value={stats.customers}
        />

        <StartCard
          title="Bookings"
          value={stats.bookings}
        />

        <StartCard
          title="Revenue"
          value={`$${stats.revenue}`}
        />

      </div>

    </DashboardLayout>

  );
};

export default Dashboard;