import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { isLoggedIn, fetchMe } from "../services/authService";
import "../booking.css";
import { useSearchParams } from "react-router-dom";
const BookingWebsite = () => {
  const navigate = useNavigate();

  const [bins, setBins] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const selectedBin = searchParams.get("bin");

  const [form, setForm] = useState({
    delivery_address: "",
    bin_id: "",
    waste_id: "",
    delivery_date: "",
    hire_weeks: 1,
  });

  useEffect(() => {

  if(
    !form.bin_id ||
    !form.waste_id
  ) return;

  const fetchPrice = async() => {

    try{

      const res = await api.post(
        "/calculate-price",
        {
          customer_id:customer?.customer_id,
          bin_id:Number(form.bin_id),
          waste_id:Number(form.waste_id),
          hire_weeks:Number(form.hire_weeks),
          delivery_address:form.delivery_address
        }
      );

      setPricing(res.data);

    }catch(err){

      console.log(err);

    }

  };

  fetchPrice();

},[
  form.bin_id,
  form.waste_id,
  form.hire_weeks,
  form.delivery_address,
  customer
]);
useEffect(() => {

  if(selectedBin){

    setForm(prev => ({
      ...prev,
      bin_id: selectedBin
    }));

  }

}, [selectedBin]);
const [pricing,setPricing]=useState({
  base_price:0,
  waste_charge:0,
  extension_fee:0,
  total:0
});

  useEffect(() => {
    if (!isLoggedIn()) {
      sessionStorage.setItem("redirect_after_login", "/booking");
      navigate("/loginpage", { replace: true });
      return;
    }
    fetchMe().then((result)=>{
    if(result.success){
      setCustomer(result.customer);
    }
      setAuthChecked(true);
});
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const binsRes = await api.get("/bins");
      const wasteRes = await api.get("/waste-types");
      setBins(binsRes.data);
      setWasteTypes(wasteRes.data);
    } catch (err) {
      console.log(err);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if(
        !form.bin_id ||
        !form.waste_id ||
        !form.delivery_address ||
        !form.delivery_date
      ){
        return;
      }
    setSubmitting(true);

    try {
      const payload = {
        customer_id: customer.customer_id,
        bin_id: parseInt(form.bin_id),
        waste_id: parseInt(form.waste_id),
        delivery_address: form.delivery_address,
        delivery_date: form.delivery_date,
        hire_weeks: parseInt(form.hire_weeks),
      };
      
      await api.post("/bookings",payload);
      const me = await fetchMe();

      if(me.success){
        setCustomer(me.customer);
      }
      setForm({
        delivery_address: "",
        bin_id: "",
        waste_id: "",
        delivery_date: "",
        hire_weeks: 1,
      });
      setPricing({
        base_price:0,
        waste_charge:0,
        extension_fee:0,
        delivery_charge:0,
        distance_km:0,
        discount:0,
        total:0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <>
        <WebsiteNavbar />
        <div className="booking-page">
          <div className="booking-card">
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
  <>
    <WebsiteNavbar />

    <div className="booking-page">

      <div className="booking-wrapper">

        {/* LEFT SIDE */}

       <div className="booking-card">

  <h1>
    Book Your Skip Bin
  </h1>

  <p className="booking-subtitle">
    Fast Delivery • Transparent Pricing • Professional Service
  </p>


<form
  id="bookingForm"
  onSubmit={submitBooking}
>
    <div className="bin-selection">

      <h3>
        Choose Bin Size
      </h3>

      <div className="bin-grid">

        {bins.map(bin => (

          <div
            key={bin.bin_id}
            className={
              String(form.bin_id) === String(bin.bin_id)
              ? "bin-option active"
              : "bin-option"
            }
            onClick={() =>
              setForm({
                ...form,
                bin_id: bin.bin_id
              })
            }
          >

            <h2>
              {bin.size}
            </h2>

            <p>
              Skip Bin
            </p>

          </div>

        ))}

      </div>

    </div>

    <div className="waste-section">

      <h3>
        Waste Type
      </h3>

      <div className="waste-grid">

        {wasteTypes.map(waste => (

          <div
            key={waste.waste_id}
            className={
              String(form.waste_id) === String(waste.waste_id)
              ? "waste-card active"
              : "waste-card"
            }
            onClick={() =>
              setForm({
                ...form,
                waste_id: waste.waste_id
              })
            }
          >

            {waste.waste_name}

          </div>

        ))}

      </div>

    </div>

    <div className="delivery-card">

      <h3>
        Delivery Details
      </h3>

      <textarea
        name="delivery_address"
        placeholder="Enter Delivery Address"
        value={form.delivery_address}
        onChange={handleChange}
        required
      />
      <br />

      <br />
      <h3> Delivery Date </h3>
      <input
        type="date"
        name="delivery_date"
        value={form.delivery_date}
        onChange={handleChange}
        min={
          new Date()
          .toISOString()
          .split("T")[0]
        }
        required
      />

      <br />
      <br />

      <div className="duration-buttons">
        <h3> Hire Duration </h3>
        {[1,2,3].map(week => (

          <button
            key={week}
            type="button"
            className={
              form.hire_weeks === week
              ? "duration-btn active"
              : "duration-btn"
            }
            onClick={() =>
              setForm({
                ...form,
                hire_weeks: week
              })
            }
          >
            {week} Week
          </button>

        ))}

      </div>

    </div>

  </form>

</div>

        {/* RIGHT SIDE */}

        <div className="summary-card">
        <div className="promo-banner">

  🎁 Every 7th Bin Hire FREE

</div>
{
pricing?.free_bin &&

<div className="success-banner">
🎉 Loyalty Reward Applied

<br/>

This customer qualifies for a FREE bin hire.

Only waste, delivery and extension charges apply.
</div>
}
  <h2>
    ORDER SUMMARY
  </h2>
        
  <div className="summary-row">
  <span>Bin Price</span>
  <span>${pricing.base_price}</span>
</div>

<div className="summary-row">
  <span>Waste Charge</span>
  <span>${pricing.waste_charge}</span>
</div>

<div className="summary-row">
  <span>Extra Week</span>
  <span>${pricing.extension_fee}</span>
</div>

<div className="summary-row">
  <span>Distance</span>
  <span>
    {pricing.distance_km || 0} km
  </span>
</div>

<div className="summary-row">
  <span>Delivery Charge</span>
  <span>${pricing.delivery_charge || 0}</span>
</div>

<div className="summary-row">
  <span>Discount</span>
  <span>-${pricing.discount || 0}</span>
</div>

<div className="summary-total">
  <h1>${pricing.total}</h1>
</div>

  <button
    type="submit"
    form="bookingForm"
    className="book-btn"
    disabled={submitting||pricing.total === 0}
  >
    {
      submitting
      ? "Processing..."
      : "COMPLETE BOOKING"
    }
  </button>

  {customer && (

    <div className="loyalty-card">

      <h3>
        🎁 Loyalty Rewards
      </h3>

      <p>
        {customer.loyalty_count || 0} / 7 Hires
      </p>

      <div className="loyalty-progress">

        <div
          className="loyalty-fill"
          style={{
            width:
            `${((customer.loyalty_count % 7)/7)*100}%`
          }}
        />

      </div>

    </div>

  )}

</div>
</div>
</div>

    <Footer />
  </>
);
};

export default BookingWebsite;