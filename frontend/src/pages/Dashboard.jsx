import React,{useEffect,useState} from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import "../dashboard.css";

const Dashboard=()=>{

  const [stats,setStats]=useState({
    customers:0,
    bookings:0,
    revenue:0
  });
const [collections,setCollections]=useState([]);
const [newBookings,setNewBookings]=useState([]);
const [deliveries,setDeliveries]=useState([]);
const [activeHires,setActiveHires]=useState([]);
const [upcomingCollections,setUpcomingCollections]=useState([]);
const [completedJobs,setCompletedJobs]=useState([]);

useEffect(()=>{

  fetchDashboard();

  loadCollections();

  loadNewBookings();

  loadDeliveries();

  loadActiveHires();

  loadUpcomingCollections();

  loadCompleted();

},[]);
const loadCollections=async()=>{

  try{

    const res=
    await api.get(
      "/collections/tomorrow"
    );

    setCollections(
      res.data
    );

  }
  catch(err){

    console.log(err);

  }

};
  const fetchDashboard=async()=>{

    try{

      const res=
      await api.get("/dashboard");

      setStats(res.data);

    }
    catch(err){

      console.log(err);

    }

  };

const loadNewBookings=async()=>{
  const res=await api.get(
    "/dashboard/new-bookings"
  );
  setNewBookings(res.data);
};

const loadDeliveries=async()=>{
  const res=await api.get(
    "/dashboard/upcoming-deliveries"
  );
  setDeliveries(res.data);
};

const loadActiveHires=async()=>{
  const res=await api.get(
    "/dashboard/active-hires"
  );
  setActiveHires(res.data);
};

const loadUpcomingCollections=async()=>{
  const res=await api.get(
    "/dashboard/upcoming-collections"
  );
  setUpcomingCollections(res.data);
};

const loadCompleted=async()=>{
  const res=await api.get(
    "/dashboard/completed-jobs"
  );
  setCompletedJobs(res.data);
};

  return(

    <DashboardLayout>

      <div className="dashboard-header">

        <h1>
          Dashboard
        </h1>

      </div>

      <div className="stats-grid">

        <div className="stat-box">
          <span>👥</span>
          <h2>{stats.customers}</h2>
          <p>Customers</p>
        </div>

        <div className="stat-box">
          <span>📦</span>
          <h2>{stats.bookings}</h2>
          <p>Bookings</p>
        </div>

        <div className="stat-box">
          <span>💰</span>
          <h2>${stats.revenue}</h2>
          <p>Revenue</p>
        </div>

        <div className="stat-box">
          <span>🚚</span>
          <h2>{upcomingCollections.length}</h2>
          <p>Collections</p>
        </div>

      </div>

      <div className="dashboard-sections">

  {/* New Bookings */}

  <div className="dashboard-widget">

    <h2>New Bookings</h2>

    {
      newBookings.length===0 ?

      <div className="empty-state">
        No new bookings
      </div>

      :

      newBookings.map(item=>(

        <div
          key={item.booking_id}
          className="widget-row"
        >

          <div>

            <strong>
              {item.customer_name}
            </strong>

            <p>
              {item.size}
            </p>

          </div>

          <span>
            NEW
          </span>

        </div>

      ))
    }

  </div>

  {/* Deliveries */}

  <div className="dashboard-widget">

    <h2>
      Upcoming Deliveries
    </h2>

    {
      deliveries.length===0 ?

      <div className="empty-state">
        No deliveries
      </div>

      :

      deliveries.map(item=>(

        <div
          key={item.booking_id}
          className="widget-row"
        >

          <div>

            <strong>
              {item.customer_name}
            </strong>

            <p>
              {item.size}
            </p>

          </div>

          <span>
            {item.delivery_date}
          </span>

        </div>

      ))
    }

  </div>

  {/* Active */}

  <div className="dashboard-widget">

    <h2>
      Active Hires
    </h2>

    {
      activeHires.length===0 ?

      <div className="empty-state">
        No active hires
      </div>

      :

      activeHires.map(item=>(

        <div
          key={item.booking_id}
          className="widget-row"
        >

          <div>

            <strong>
              {item.customer_name}
            </strong>

            <p>
              {item.size}
            </p>

          </div>

          <span>
            {item.collection_date}
          </span>

        </div>

      ))
    }

  </div>

  {/* Collections */}

  <div className="dashboard-widget">

    <h2>
      Upcoming Collections
    </h2>

    {
      upcomingCollections.length===0 ?

      <div className="empty-state">
        No collections
      </div>

      :

      upcomingCollections.map(item=>(

        <div
          key={item.booking_id}
          className="widget-row"
        >

          <div>

            <strong>
              {item.customer_name}
            </strong>

            <p>
              {item.size}
            </p>

          </div>

          <span>
            {item.collection_date}
          </span>

        </div>

      ))
    }

  </div>

  {/* Completed */}

  <div className="dashboard-widget full-width">

    <h2>
      Completed Jobs
    </h2>

    {
      completedJobs.length===0 ?

      <div className="empty-state">
        No completed jobs
      </div>

      :

      completedJobs.map(item=>(

        <div
          key={item.booking_id}
          className="widget-row"
        >

          <div>

            <strong>
              {item.customer_name}
            </strong>

            <p>
              {item.size}
            </p>

          </div>

          <span>
            ${item.total_amount}
          </span>

        </div>

      ))
    }

  </div>

</div>


    </DashboardLayout>

  );

};

export default Dashboard;