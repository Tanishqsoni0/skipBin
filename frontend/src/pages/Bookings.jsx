import React, {
  useEffect,
  useState
} from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import api
from "../services/api";

const Bookings = () => {
  const [customers,setCustomers] = useState([]);
  const [bookings,
  setBookings] =
  useState([]);

  const [form,
  setForm] =
  useState({

    customer_id:"",
    bin_id:"",
    waste_id:"",
    delivery_address:"",
    delivery_date:"",
    hire_weeks:1,
    distance_km:0

  });

  const [editingId,setEditingId]=useState(null);

const [editForm,setEditForm]=useState({
  status:""
});

useEffect(() => {

  const load = async () => {

    await loadCustomers();

    await fetchBookings();

  };

  load();

}, []);
const loadCustomers = async() => {

  try{

    const res = await api.get("/customers");

    setCustomers(res.data);

  }
  catch(err){

    console.log(
      "CUSTOMER ERROR",
      err.response?.data
    );

  }

};
  const fetchBookings =
  async () => {

    try {

      const res =
      await api.get(
        "/bookings"
      );

      setBookings(
        res.data
      );

    } catch (err) {

      console.log(err);

    }
  };

  const handleChange =
  (e) => {

    setForm({

      ...form,

      [e.target.name]:
      e.target.value

    });

  };

  const createBooking =
  async (e) => {

    e.preventDefault();

    try {

      await api.post(
        "/bookings",
        form
      );

      alert(
        "Booking Created"
      );

      fetchBookings();

    } catch (err) {

      console.log(err);

    }
  };

  const updateStatus =
async(id,status)=>{

  console.log(
    "Updating",
    id,
    status
  );

  try{

    const res =
    await api.put(
      `/bookings/${id}/status`,
      {status}
    );

    console.log(res.data);

    setEditingId(null);

    fetchBookings();

  }
  catch(err){

    console.log(err.response);

  }

};
console.log(customers);
  return (

    <DashboardLayout>
      <div className="page-header">
      <h1>
        Bookings
      </h1>
  <p>
    Manage your bookings here.
  </p>
  </div>

      <div className="pricing-card">

        <h2 className="pricing-card-title">
          Create Booking
        </h2>

        <form
        className="pricing-form"
        onSubmit={
          createBooking
        }
        >

          <select
  name="customer_id"
  value={form.customer_id}
  onChange={handleChange}
>
  <option value="">
    Select Customer
  </option>

  {customers.map(c => (
    <option
      key={c.customer_id}
      value={c.customer_id}
    >
      {c.full_name}
    </option>
  ))}
</select>

          <select
  name="bin_id"
  value={form.bin_id}
  onChange={handleChange}
>
  <option value="">
    Select Bin
  </option>

  <option value="1">2m³ Skip Bin</option>
  <option value="2">3m³ Skip Bin</option>
  <option value="3">4m³ Skip Bin</option>
  <option value="4">6m³ Skip Bin</option>
  <option value="5">8m³ Skip Bin</option>
  <option value="6">10m³ Skip Bin</option>
</select>


          <select
  name="waste_id"
  value={form.waste_id}
  onChange={handleChange}
>
  <option value="">
    Select Waste Type
  </option>

  <option value="1">General Waste</option>
  <option value="2">Green Waste</option>
  <option value="3">Mixed Waste</option>
</select>


          <input
            type="text"
            name="delivery_address"
            placeholder="Address"
            value={
              form.delivery_address
            }
            onChange={
              handleChange
            } 
            required
          />


          <input
            type="date"
            name="delivery_date"
            value={
              form.delivery_date
            }
            onChange={
              handleChange
            }
            required
          />


          <input
            type="text"
            name="hire_weeks"
            placeholder="Weeks"
            value={
              form.hire_weeks
            }
            onChange={
              handleChange
            }
            required
          />


          <input
            type="text"
            name="distance_km"
            placeholder="Distance KM"
            value={
              form.distance_km
            }
            onChange={
              handleChange
            }
            required
          />


          <button
          type="submit"
          className="pricing-btn"
          >
            Create Booking
          </button>

        </form>

      </div>

    
      <div
      className="stat-card"
      >

        <h2>
          All Bookings
        </h2>
        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Customer</th>

              <th>Bin</th>

              <th>Status</th>

              <th>Total</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

{
bookings.map((b)=>(

<tr key={b.booking_id}>

  <td>
    {b.booking_id}
  </td>

  <td>
    {b.full_name}
  </td>

  <td>
    {b.size}
  </td>

  <td>

    {
    editingId===b.booking_id ?

    <select
      value={editForm.status}
      onChange={(e)=>
        setEditForm({
          ...editForm,
          status:e.target.value
        })
      }
    >

      <option value="NEW">
        NEW
      </option>

      <option value="CONFIRMED">
        CONFIRMED
      </option>

      <option value="ACTIVE">
        ACTIVE
      </option>

      <option value="COMPLETED">
        COMPLETED
      </option>

    </select>

    :

    b.status

    }

  </td>

  <td>
    ${b.total_amount}
  </td>

  <td>

    {
    editingId===b.booking_id ?

    <>

      <button
        className="edit-btn"
        onClick={()=>
          updateStatus(
            b.booking_id,
            editForm.status
          )
        }
      >
        Save
      </button>

      <button
        className="delete-btn"
        onClick={()=>
          setEditingId(null)
        }
      >
        Cancel
      </button>

    </>

    :

    <button
      className="edit-btn"
      onClick={()=>{
        setEditingId(
          b.booking_id
        );

        setEditForm({
          status:b.status
        });
      }}
    >
      Edit
    </button>

    }

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

export default Bookings;