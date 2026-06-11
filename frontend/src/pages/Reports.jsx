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
  
  const [promotionImpact,
setPromotionImpact] =
useState({});

  const [customerValue,
  setCustomerValue] =
  useState([]);

  const [loyalty,
  setLoyalty] =
  useState({});
    const [impact,setImpact] =
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

      const promoRes =
await api.get(
"/reports/promotions-impact"
);

const impactRes =
await api.get(
"/reports/revenue-impact"
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

setPromotionImpact(
promoRes.data
);  

setImpact(
impactRes.data
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
          title="Total Bins Hired"
          value={
            loyalty.summary?.total_bins || 0
          }
        />

<StartCard
 title="Rewards Issued"
 value={
   loyalty.rewards_issued || 0
 }
/>

<StartCard
  title="Discounts Given"
  value={
    `$${promotionImpact.total_discount || 0}`
  }
/>

<StartCard
title="Promotion Impact"
value={
`$${impact.promotion_discount || 0}`
}
/>

<StartCard
title="Loyalty Impact"
value={
`$${impact.loyalty_discount || 0}`
}
/>

<StartCard
title="Revenue Impact"
value={
`$${impact.total_impact || 0}`
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