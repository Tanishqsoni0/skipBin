import React,
{
 useEffect,
 useState
}
from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import api
from "../services/api";

const DistanceCharges=()=>{

 const [charges,
 setCharges]=
 useState([]);

 const [form,
 setForm]=
 useState({
  min_km:"",
  max_km:"",
  charge:""
 });

 const [editingId,setEditingId] =
useState(null);

const [editForm,setEditForm] =
useState({
  min_km:"",
  max_km:"",
  charge:""
});
 const loadData=
 async()=>{

  const res=
  await api.get(
   "/distance-charges"
  );

  setCharges(
   res.data
  );
 };
 const updateCharge = async(id) => {

  try{

    await api.put(
      `/distance-charges/${id}`,
      editForm
    );

    setEditingId(null);

    loadData();

  }catch(err){

    console.log(err);

  }

};

 useEffect(()=>{

  loadData();

 },[]);

 const addCharge=
 async()=>{

  await api.post(
   "/distance-charges",
   form
  );

  loadData();
 };

 const deleteCharge=
 async(id)=>{

  await api.delete(
   `/distance-charges/${id}`
  );

  loadData();
 };

 return(

 <DashboardLayout>
    <div className="page-header">
 <h1>
 Distance Charges
 </h1>
 <p>
    Manage delivery surcharge pricing based on customer distance.
  </p>
</div>

    <div className="pricing-card">

 <h2 className="pricing-card-title">
 Add Distance Charge
 </h2>
 <form
    className="pricing-form"
    onSubmit={addCharge}
 >
 <input
 type="number"
 name="min_km"
 placeholder="Min KM"
 value={form.min_km}
 onChange={(e)=>
 setForm({
  ...form,
  min_km:e.target.value
 })}
 required
 />

 <input
    type="number"
    name="max_km"
 placeholder="Max KM"
 value={form.max_km}
 onChange={(e)=>
 setForm({
  ...form,
  max_km:e.target.value
 })}
    required
 />

 <input
    type="number"
    name="charge"
 placeholder="Charge"
 value={form.charge}
 onChange={(e)=>
 setForm({
  ...form,
  charge:e.target.value
 })}
    required
 />

 <button
 type="submit"
    className="pricing-btn"
 >
 Add Charge
 </button>
</form>
</div>

<div className="stat-card">
    <h2>
    Distance Charges
    </h2>
 <table>

 <thead>
 <tr>
 <th>Min</th>
 <th>Max</th>
 <th>Charge</th>
 <th>Action</th>
 </tr>
 </thead>

<tbody>

{charges.map((c) => (

<tr key={c.distance_id}>

  <td>
    {c.distance_id}
  </td>

  <td>

    {
    editingId === c.distance_id ?

    <input
      type="number"
      value={editForm.min_km}
      onChange={(e)=>
      setEditForm({
        ...editForm,
        min_km:e.target.value
      })}
    />

    :

    c.min_km
    }

  </td>

  <td>

    {
    editingId === c.distance_id ?

    <input
      type="number"
      value={editForm.max_km}
      onChange={(e)=>
      setEditForm({
        ...editForm,
        max_km:e.target.value
      })}
    />

    :

    c.max_km
    }

  </td>

  <td>

    {
    editingId === c.distance_id ?

    <input
      type="number"
      value={editForm.charge}
      onChange={(e)=>
      setEditForm({
        ...editForm,
        charge:e.target.value
      })}
    />

    :

    `$${c.charge}`
    }

  </td>

  <td>

    {
    editingId === c.distance_id ?

    <>

      <button
        className="edit-btn"
        onClick={() =>
          updateCharge(
            c.distance_id
          )
        }
      >
        Save
      </button>

      <button
        className="delete-btn"
        onClick={() =>
          setEditingId(null)
        }
      >
        Cancel
      </button>

    </>

    :

    <>

      <button
        className="edit-btn"
        onClick={() => {

          setEditingId(
            c.distance_id
          );

          setEditForm({
            min_km:c.min_km,
            max_km:c.max_km,
            charge:c.charge
          });

        }}
      >
        Edit
      </button>

      <button
        className="delete-btn"
        onClick={() =>
          deleteCharge(
            c.distance_id
          )
        }
      >
        Delete
      </button>

    </>

    }

  </td>

</tr>

))}

</tbody>

 </table>
 </div>

 </DashboardLayout>

 );

};

export default DistanceCharges;