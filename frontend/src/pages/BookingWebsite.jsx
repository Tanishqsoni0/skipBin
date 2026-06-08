import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { isLoggedIn, fetchMe } from "../services/authService";
import "../booking.css";
const BookingWebsite = () => {
  const navigate = useNavigate();

  const [bins, setBins] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [collectionDate,setCollectionDate]=useState("");
  const [form, setForm] = useState({
    customer_name: "",
    mobile: "",
    email: "",
    delivery_address: "",
    bin_id: "",
    waste_id: "",
    delivery_date: "",
    hire_weeks: 1,
  });

const [pricing,setPricing]=useState({
  base_price:0,
  waste_charge:0,
  extension_fee:0,
  total:0
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
          bin_id:Number(form.bin_id),
          waste_id:Number(form.waste_id),
          hire_weeks:Number(form.hire_weeks)
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
  form.hire_weeks
]);
  // ── Step 1: Check login, redirect if not logged in ───────────────────────
  useEffect(() => {
    if (!isLoggedIn()) {
      sessionStorage.setItem("redirect_after_login", "/booking");
      navigate("/loginpage", { replace: true });
      return;
    }

    // ── Step 2: Fetch profile and pre-fill form ──────────────────────────
    fetchMe().then((result) => {
      if (result.success) {
        const c = result.customer;
        setCustomer(c);
        setForm((prev) => ({
          ...prev,
          customer_name: `${c.first_name} ${c.last_name}`.trim(),
          mobile: c.mobile || "",
          email: c.email || "",
        }));
      } else {
        sessionStorage.setItem("redirect_after_login", "/booking");
        navigate("/loginpage", { replace: true });
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
    if (name === "mobile" && !/^\d*$/.test(value)) return;
    setForm({ ...form, [name]: value });
  };

  // ── Submit booking to backend ────────────────────────────────────────────
  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        customer_id: customer.customer_id,
        bin_id: parseInt(form.bin_id),
        waste_id: parseInt(form.waste_id),
        delivery_address: form.delivery_address,
        delivery_date: form.delivery_date,
        hire_weeks: parseInt(form.hire_weeks),
        distance_km: 0, // placeholder — distance service coming later
      };

      const res = await api.post("/bookings", payload);

      setBookingSuccess(
        `Booking confirmed!
         Your bin will be collected on ${res.data.collection_date}. 
         Total: $${res.data.total_amount}`
      );

      // Reset only the fields the customer filled in
      setForm((prev) => ({
        ...prev,
        delivery_address: "",
        bin_id: "",
        waste_id: "",
        delivery_date: "",
        hire_weeks: 1,
      }));

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Booking failed. Please try again.";
      setBookingError(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render until auth check is complete
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

  {bookingSuccess && (
    <div className="booking-success-msg">
      {bookingSuccess}
    </div>
  )}

  {bookingError && (
    <div className="booking-error-msg">
      {bookingError}
    </div>
  )}

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
              form.hire_weeks == week
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
  <span>Collection</span>
  <span>{collectionDate || "-"}</span>
</div>

<div className="summary-total">
  <h1>${pricing.total}</h1>
</div>

  <div className="summary-total">

  </div>

  <button
    type="submit"
    form="bookingForm"
    className="book-btn"
    disabled={submitting}
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
            `${(customer.loyalty_count % 7)*14.28}%`
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