import React, {
  useEffect,
  useState
} from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import api
from "../services/api";

const Bookings = () => {

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

  useEffect(() => {

    fetchBookings();

  }, []);

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

    try{

      await api.put(
        `/bookings/${id}/status`,
        {
          status
        }
      );

      fetchBookings();

    }catch(err){

      console.log(err);

    }

  };

  return (

    <DashboardLayout>

      <h1
      className="page-title"
      >
        Bookings
      </h1>

      <div
      className="stat-card"
      >

        <h3>
          Create Booking
        </h3>

        <br />

        <form
        onSubmit={
          createBooking
        }
        >

          <input
            type="number"
            name="customer_id"
            placeholder="Customer ID"
            value={
              form.customer_id
            }
            onChange={
              handleChange
            }
          />

          <br /><br />

          <input
            type="number"
            name="bin_id"
            placeholder="Bin ID"
            value={
              form.bin_id
            }
            onChange={
              handleChange
            }
          />

          <br /><br />

          <input
            type="number"
            name="waste_id"
            placeholder="Waste ID"
            value={
              form.waste_id
            }
            onChange={
              handleChange
            }
          />

          <br /><br />

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
          />

          <br /><br />

          <input
            type="date"
            name="delivery_date"
            value={
              form.delivery_date
            }
            onChange={
              handleChange
            }
          />

          <br /><br />

          <input
            type="number"
            name="hire_weeks"
            placeholder="Weeks"
            value={
              form.hire_weeks
            }
            onChange={
              handleChange
            }
          />

          <br /><br />

          <input
            type="number"
            name="distance_km"
            placeholder="Distance KM"
            value={
              form.distance_km
            }
            onChange={
              handleChange
            }
          />

          <br /><br />

          <button
          type="submit"
          >
            Create Booking
          </button>

        </form>

      </div>

      <br />

      <div
      className="table-container"
      >

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
              bookings.map(
              (b) => (

                <tr
                key={
                  b.booking_id
                }
                >

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
                    {b.status}
                  </td>

                  <td>
                    $
                    {b.total_amount}
                  </td>

                  <td>

                    <button
                    onClick={()=>
                    updateStatus(
                      b.booking_id,
                      "CONFIRMED"
                    )}
                    >
                      Confirm
                    </button>

                    {" "}

                    <button
                    onClick={()=>
                    updateStatus(
                      b.booking_id,
                      "ACTIVE"
                    )}
                    >
                      Active
                    </button>

                    {" "}

                    <button
                    onClick={()=>
                    updateStatus(
                      b.booking_id,
                      "COMPLETED"
                    )}
                    >
                      Complete
                    </button>

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