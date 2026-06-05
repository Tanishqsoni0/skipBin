import React, {
  useState,
  useEffect
} from "react";

import WebsiteNavbar
from "../components/WebsiteNavbar";

import Footer
from "../components/Footer";

import api
from "../services/api";

const BookingWebsite = () => {

  const [bins,
  setBins] =
  useState([]);

  const [wasteTypes,
  setWasteTypes] =
  useState([]);

  const [form,
  setForm] =
  useState({

    customer_name:"",
    mobile:"",
    email:"",
    delivery_address:"",
    bin_id:"",
    waste_id:"",
    delivery_date:"",
    hire_weeks:1

  });

  useEffect(()=>{

    loadData();

  },[]);

  const loadData =
  async()=>{

    try{

      const binsRes =
      await api.get("/bins");

      const wasteRes =
      await api.get("/waste-types");

      setBins(
        binsRes.data
      );

      setWasteTypes(
        wasteRes.data
      );

    }catch(err){

      console.log(err);

    }

  };

  const handleChange =
  (e)=>{

    setForm({

      ...form,

      [e.target.name]:
      e.target.value

    });

  };

  const submitBooking =
  async(e)=>{

    e.preventDefault();

    alert(
      "Booking Submitted"
    );

    console.log(form);

  };

  return(

    <>

      <WebsiteNavbar />

      <div
      className="booking-page"
      >

        <div
        className="booking-card"
        >

          <h1>
            Book A Skip Bin
          </h1>

          <br/>

          <form
          onSubmit={
            submitBooking
          }
          >

            <input
              type="text"
              name="customer_name"
              placeholder="Full Name"
              value={
                form.customer_name
              }
              onChange={
                handleChange
              }
            />

            <br/><br/>

            <input
              type="text"
              name="mobile"
              placeholder="Mobile"
              value={
                form.mobile
              }
              onChange={
                handleChange
              }
            />

            <br/><br/>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={
                form.email
              }
              onChange={
                handleChange
              }
            />

            <br/><br/>

            <textarea
              name="delivery_address"
              placeholder="Delivery Address"
              value={
                form.delivery_address
              }
              onChange={
                handleChange
              }
            />

            <br/><br/>

            <select
              name="bin_id"
              value={
                form.bin_id
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Select Bin
              </option>

              {
                bins.map(
                (bin)=>(

                  <option
                  key={
                    bin.bin_id
                  }
                  value={
                    bin.bin_id
                  }
                  >

                    {bin.size}

                  </option>

                ))
              }

            </select>

            <br/><br/>

            <select
              name="waste_id"
              value={
                form.waste_id
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Select Waste Type
              </option>

              {
                wasteTypes.map(
                (waste)=>(

                  <option
                  key={
                    waste.waste_id
                  }
                  value={
                    waste.waste_id
                  }
                  >

                    {waste.waste_name}

                  </option>

                ))
              }

            </select>

            <br/><br/>

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

            <br/><br/>

            <input
              type="number"
              name="hire_weeks"
              min="1"
              max="3"
              value={
                form.hire_weeks
              }
              onChange={
                handleChange
              }
            />

            <br/><br/>

            <button
            type="submit"
            >
              Book Bin
            </button>

          </form>

        </div>

      </div>

      <Footer />

    </>

  );

};

export default BookingWebsite;