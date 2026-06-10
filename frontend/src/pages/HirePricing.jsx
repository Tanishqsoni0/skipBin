import React,{
useEffect,
useState
} from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import api
from "../services/api";

const HirePricing=()=>{

const [fee,setFee]=
useState("");

useEffect(()=>{
loadFee();
},[]);

const loadFee=async()=>{

const res=
await api.get(
"/hire-pricing"
);

setFee(
res.data.extension_fee
);

};

const saveFee=async()=>{

await api.put(
"/hire-pricing",
{
extension_fee:fee
}
);

alert(
"Pricing Updated"
);

};

return(

<DashboardLayout>

<div className="page-header">

<h1>
Hire Extension Pricing
</h1>

<p>
Manage extra weekly hire fees.
</p>

</div>

<div className="pricing-card">

  <h2>
    Extension Fee Per Week
  </h2>

  <div className="pricing-form">

    <input
      type="number"
      value={fee}
      onChange={(e)=>
        setFee(e.target.value)
      }
    />

    <button
      className="pricing-btn"
      onClick={saveFee}
    >
      Save Pricing
    </button>

  </div>

</div>

<div className="pricing-card">

  <h2>
    Current Pricing
  </h2>

  <table>

    <thead>

      <tr>

        <th>
          Pricing Type
        </th>

        <th>
          Current Fee
        </th>

      </tr>

    </thead>

    <tbody>

      <tr>

        <td>
          Weekly Hire Extension
        </td>

        <td>
          ${fee}
        </td>

      </tr>

    </tbody>

  </table>

</div>
</DashboardLayout>

);

};

export default HirePricing;