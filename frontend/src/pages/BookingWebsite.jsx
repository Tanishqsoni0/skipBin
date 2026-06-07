import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { isLoggedIn, fetchMe } from "../services/authService";

const BookingWebsite = () => {
  const navigate = useNavigate();

  const [bins, setBins] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [bookingError, setBookingError] = useState("");

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
        `Booking confirmed! 🎉 Your bin will be collected on ${res.data.collection_date}. Total: $${res.data.total_amount}`
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
        <div className="booking-card">
          <h1>Book A Skip Bin</h1>

          <br />

          {/* Loyalty progress banner */}
          {customer && (
            <div className="booking-loyalty-banner">
              🎁 You have hired <strong>{customer.loyalty_count}</strong> bin
              {customer.loyalty_count !== 1 ? "s" : ""} —{" "}
              <strong>{7 - (customer.loyalty_count % 7)}</strong> more until
              your next free hire!
            </div>
          )}

          {/* Success message */}
          {bookingSuccess && (
            <div className="booking-success-msg">{bookingSuccess}</div>
          )}

          {/* Error message */}
          {bookingError && (
            <div className="booking-error-msg">⚠️ {bookingError}</div>
          )}

          <form onSubmit={submitBooking}>

            {/* ── Pre-filled read-only fields ── */}
            <div className="prefilled-field">
              <label>Full Name</label>
              <input
                type="text"
                name="customer_name"
                value={form.customer_name}
                readOnly
                className="input-readonly"
              />
            </div>

            <br />

            <div className="prefilled-field">
              <label>Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                readOnly
                className="input-readonly"
              />
            </div>

            <br />

            <div className="prefilled-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className="input-readonly"
              />
            </div>

            <br />

            {/* ── Fields the customer fills in ── */}
            <textarea
              name="delivery_address"
              placeholder="Delivery Address"
              value={form.delivery_address}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <select
              name="bin_id"
              value={form.bin_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Bin</option>
              {bins.map((bin) => (
                <option key={bin.bin_id} value={bin.bin_id}>
                  {bin.size}
                </option>
              ))}
            </select>

            <br />
            <br />

            <select
              name="waste_id"
              value={form.waste_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Waste Type</option>
              {wasteTypes.map((waste) => (
                <option key={waste.waste_id} value={waste.waste_id}>
                  {waste.waste_name}
                </option>
              ))}
            </select>

            <br />
            <br />

            <input
              type="date"
              name="delivery_date"
              value={form.delivery_date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />

            <br />
            <br />

            <input
              type="number"
              name="hire_weeks"
              min="1"
              max="3"
              value={form.hire_weeks}
              onChange={handleChange}
              required
            />

            <br />
            <br />

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Book Bin"}
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BookingWebsite;