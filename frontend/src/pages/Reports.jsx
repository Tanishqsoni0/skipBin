import React, {
  useEffect,
  useState
} from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import StartCard
from "../components/StartCard";

import api
from "../services/api";

const Reports = () => {

  const [dashboard,
  setDashboard] =
  useState({
    customers:0,
    bookings:0,
    revenue:0
  });

  const [topCustomers,
  setTopCustomers] =
  useState([]);

  const [customerValue,
  setCustomerValue] =
  useState([]);

  const [loyalty,
  setLoyalty] =
  useState({});

  useEffect(()=>{

    loadReports();

  },[]);

  const loadReports =
  async()=>{

    try{

      const dashboardRes =
      await api.get(
        "/dashboard"
      );

      const topRes =
      await api.get(
        "/reports/top-customers"
      );

      const valueRes =
      await api.get(
        "/reports/customer-value"
      );

      const loyaltyRes =
      await api.get(
        "/reports/loyalty"
      );

      setDashboard(
        dashboardRes.data
      );

      setTopCustomers(
        topRes.data
      );

      setCustomerValue(
        valueRes.data
      );

      setLoyalty(
        loyaltyRes.data
      );

    }catch(err){

      console.log(err);

    }

  };

  return (

    <DashboardLayout>

      <h1 className="page-title">
        Reports & Analytics
      </h1>

      <div className="cards">

        <StartCard
          title="Customers"
          value={
            dashboard.customers
          }
        />

        <StartCard
          title="Bookings"
          value={
            dashboard.bookings
          }
        />

        <StartCard
          title="Revenue"
          value={
            `$${dashboard.revenue}`
          }
        />

        <StartCard
          title="Rewards Issued"
          value={
            loyalty.total_rewards || 0
          }
        />

      </div>

      <br />

      <div className="table-container">

        <h2>
          Top Customers
        </h2>

        <br />

        <table>

          <thead>

            <tr>

              <th>
                Customer
              </th>

              <th>
                Bookings
              </th>

            </tr>

          </thead>

          <tbody>

            {
              topCustomers.map(
              (c,index)=>(

                <tr
                key={index}
                >

                  <td>
                    {c.full_name}
                  </td>

                  <td>
                    {c.total_bookings}
                  </td>

                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

      <br />

      <div className="table-container">

        <h2>
          Customer Lifetime Value
        </h2>

        <br />

        <table>

          <thead>

            <tr>

              <th>
                Customer
              </th>

              <th>
                Lifetime Value
              </th>

            </tr>

          </thead>

          <tbody>

            {
              customerValue.map(
              (c,index)=>(

                <tr
                key={index}
                >

                  <td>
                    {c.full_name}
                  </td>

                  <td>
                    $
                    {c.lifetime_value}
                  </td>

                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

    </DashboardLayout>

  );

};

export default Reports;