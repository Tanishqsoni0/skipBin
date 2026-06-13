import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import api from "../services/api";
import {
  isLoggedIn,
  fetchMe,
  getAccessToken,
  invalidateMeCache,
} from "../services/authService";
import "../booking.css";

// Read from your single .env file in skipbins/
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
console.log("PAYPAL_CLIENT_ID =", process.env.REACT_APP_PAYPAL_CLIENT_ID);
console.log("API_URL =", API_URL);
const BookingWebsite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedBin = searchParams.get("bin"); 
  const paypalRef = useRef(null);

  const [bins, setBins] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loyalty, setLoyalty] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [step, setStep] = useState("form");

  const [form, setForm] = useState({
    delivery_address: "",
    bin_id: "",
    waste_id: "",
    delivery_date: "",
    hire_weeks: 1,
  });

  const [pricing, setPricing] = useState({
    base_price: 0,
    waste_charge: 0,
    extension_fee: 0,
    delivery_charge: 0,
    distance_km: 0,
    total: 0,
  });
  
  useEffect(() => {
    if (selectedBin) {
      setForm((prev) => ({ ...prev, bin_id: selectedBin }));
    }
  }, [selectedBin]);


  // ── Auth check + pre-fill ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn()) {
      sessionStorage.setItem("redirect_after_login", "/booking");
      navigate("/loginpage", { replace: true });
      return;
    }
    fetchMe().then((result) => {
      if (result.success) {
        const c = result.customer;
        setCustomer(c);
        setLoyalty(result.loyalty);
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

  // ── Auto-calculate when bin/waste/weeks change ────────────────────────────
  useEffect(() => {
    if (!form.bin_id || !form.waste_id) return;
    fetchPrice();
  }, [form.bin_id, form.waste_id, form.hire_weeks, form.delivery_address, customer]);

  // ── Load PayPal SDK when on payment step ──────────────────────────────────
  useEffect(() => {
    if (step !== "payment" || !paypalOrderId) return;

    const existing = document.getElementById("paypal-sdk");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=AUD`;
    script.async = true;
    script.onload = renderPayPalButtons;
    document.body.appendChild(script);
  }, [step, paypalOrderId]);

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

  const fetchPrice = async () => {
    try {
      const res = await api.post("/calculate-price", {
        customer_id: customer?.customer_id,
        bin_id: Number(form.bin_id),
        waste_id: Number(form.waste_id),
        hire_weeks: Number(form.hire_weeks),
        delivery_address: form.delivery_address,
      });
      setPricing(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ── COMPLETE BOOKING → create PayPal order ────────────────────────────────
  const handleCompleteBooking = async (e) => {
    e.preventDefault();
    setBookingError("");

    if (!form.bin_id || !form.waste_id) {
      setBookingError("Please select a bin size and waste type.");
      return;
    }
    if (!form.delivery_address) {
      setBookingError("Please enter a delivery address.");
      return;
    }
    if (!form.delivery_date) {
      setBookingError("Please select a delivery date.");
      return;
    }

    setSubmitting(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bin_id: form.bin_id,
          waste_id: form.waste_id,
          hire_weeks: form.hire_weeks,
          delivery_address: form.delivery_address,
          delivery_date: form.delivery_date,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setPaypalOrderId(result.paypal_order_id);
        setLoyaltyDiscount(result.loyalty_discount || 0);
        // Update pricing with confirmed values from server — don't reset
        setPricing((prev) => ({
          ...prev,
          total: result.total_amount,
        }));
        setStep("payment");
      } else {
        setBookingError(result.error || "Could not create payment.");
      }
    } catch (err) {
      setBookingError("Failed to connect to payment service.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render PayPal buttons ─────────────────────────────────────────────────
  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalRef.current) return;
    paypalRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        createOrder: () => paypalOrderId,

        onApprove: async (data) => {
          setBookingError("");
          try {
            const token = getAccessToken();
            const res = await fetch(`${API_URL}/api/payment/capture`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ paypal_order_id: data.orderID }),
            });
            const result = await res.json();
            if (result.success) {
              setBookingResult(result);
              invalidateMeCache();
              fetchMe().then((r) => {
                if (r.success){ 
                  setCustomer(r.customer);
                  setLoyalty(r.loyalty);
                }
              });
              setStep("success");
            } else {
              setBookingError(result.error || "Payment capture failed.");
            }
          } catch (err) {
            setBookingError(
              "Something went wrong confirming payment. Please contact us.",
            );
          }
        },

        onCancel: () => {
          setBookingError("Payment cancelled. Your booking was not confirmed.");
          setStep("form");
        },

        onError: (err) => {
          setBookingError("PayPal encountered an error. Please try again.");
          setStep("form");
          console.error(err);
        },

        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
        },
      })
      .render(paypalRef.current);
  };

  const resetForm = () => {
    setStep("form");
    setForm((prev) => ({
      ...prev,
      delivery_address: "",
      bin_id: "",
      waste_id: "",
      delivery_date: "",
      hire_weeks: 1,
    }));
    setPricing({
      base_price: 0,
      waste_charge: 0,
      extension_fee: 0,
      delivery_charge: 0,
      distance_km: 0,
      total: 0,
    });
    setPaypalOrderId(null);
    setBookingResult(null);
    setBookingError("");
    setLoyaltyDiscount(0);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <>
        <WebsiteNavbar />
        <div className="booking-page">
          <div
            className="booking-card"
            style={{ maxWidth: 400, margin: "0 auto" }}
          >
            <p style={{ color: "#94a3b8" }}>Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // SUCCESS SCREEN
  if (step === "success" && bookingResult) {
    return (
      <>
        <WebsiteNavbar />
        <div className="booking-page">
          <div
            className="booking-wrapper"
            style={{ maxWidth: 600, margin: "0 auto", display: "block" }}
          >
            <div className="booking-card" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  margin: "0 auto 24px",
                  color: "#34d399",
                }}
              >
                ✓
              </div>
              <h1 style={{ fontSize: 38 }}>Booking Confirmed!</h1>
              <p className="booking-subtitle">
                Your payment was successful and your skip bin is booked.
              </p>
              <div
                className="summary-card"
                style={{ textAlign: "left", marginBottom: 24 }}
              >
                <div className="summary-row">
                  <span>Booking Reference</span>
                  <strong style={{ color: "#3b82f6" }}>
                    {bookingResult.booking_ref}
                  </strong>
                </div>
                <div className="summary-row">
                  <span>Collection Date</span>
                  <span>{bookingResult.collection_date}</span>
                </div>
                <div className="summary-total">
                  <h1>${bookingResult.total_amount.toFixed(2)}</h1>
                </div>
              </div>
              <button className="book-btn" onClick={resetForm}>
                Book Another Bin
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // PAYMENT SCREEN
  if (step === "payment") {
    return (
      <>
        <WebsiteNavbar />
        <div className="booking-page">
          <div
            className="booking-wrapper"
            style={{ maxWidth: 700, margin: "0 auto", display: "block" }}
          >
            <div className="booking-card">
              <h1 style={{ fontSize: 38 }}>Complete Payment</h1>
              <p className="booking-subtitle">
                Review your order and pay securely via PayPal
              </p>

              {bookingError && (
                <div className="booking-error-msg"> {bookingError}</div>
              )}

              <div
                className="summary-card"
                style={{ position: "static", marginBottom: 24 }}
              >
                <h2>ORDER SUMMARY</h2>
                <div className="summary-row">
                  <span>Bin Price</span>
                  <span>${pricing.base_price}</span>
                </div>
                <div className="summary-row">
                  <span>Waste Charge</span>
                  <span>${pricing.waste_charge}</span>
                </div>
                <div className="summary-row">
                  <span>Extension Fee</span>
                  <span>${pricing.extension_fee}</span>
                </div>
                <div className="summary-row">
                  <span>Distance</span>
                  <span>{pricing.distance_km || 0} km</span>
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
                  <h1>
                    $
                    {typeof pricing.total === "number"
                      ? pricing.total.toFixed(2)
                      : pricing.total}{" "}
                    AUD
                  </h1>
                </div>
              </div>

              <div ref={paypalRef} style={{ marginBottom: 16 }} />

              <button
                className="book-btn"
                style={{ background: "rgba(255,255,255,0.1)", marginTop: 8 }}
                onClick={() => setStep("form")}
              >
                ← Back to Booking
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // MAIN BOOKING FORM
  return (
    <>
      <WebsiteNavbar />

      <div className="booking-page">
        <div className="booking-wrapper">
          {/* LEFT SIDE */}
          <div className="booking-card">
            <h1>Book Your Skip Bin</h1>
            <p className="booking-subtitle">
              Fast Delivery • Transparent Pricing • Professional Service
            </p>

            {bookingError && (
              <div className="booking-error-msg"> {bookingError}</div>
            )}

            <form id="bookingForm" onSubmit={handleCompleteBooking}>
              <div className="bin-selection">
                <h3>Choose Bin Size</h3>
                <div className="bin-grid">
                  {bins.map((bin) => (
                    <div
                      key={bin.bin_id}
                      className={
                        String(form.bin_id) === String(bin.bin_id)
                          ? "bin-option active"
                          : "bin-option"
                      }
                      onClick={() => setForm({ ...form, bin_id: bin.bin_id })}
                    >
                      <h2>{bin.size}</h2>
                      <p>Skip Bin</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="waste-section">
                <h3>Waste Type</h3>
                <div className="waste-grid">
                  {wasteTypes.map((waste) => (
                    <div
                      key={waste.waste_id}
                      className={
                        String(form.waste_id) === String(waste.waste_id)
                          ? "waste-card active"
                          : "waste-card"
                      }
                      onClick={() =>
                        setForm({ ...form, waste_id: waste.waste_id })
                      }
                    >
                      {waste.waste_name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="delivery-card">
                <h3>Delivery Details</h3>
                <textarea
                  name="delivery_address"
                  placeholder="Enter Delivery Address"
                  value={form.delivery_address}
                  onChange={handleChange}
                  required
                />
                <br />
                <br />
                <h3>Delivery Date</h3>
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
                <div className="duration-buttons">
                  <h3>Hire Duration</h3>
                  {[1, 2, 3].map((week) => (
                    <button
                      key={week}
                      type="button"
                      className={
                        form.hire_weeks === week
                          ? "duration-btn active"
                          : "duration-btn"
                      }
                      onClick={() => setForm({ ...form, hire_weeks: week })}
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
            {pricing?.free_bin && (
              <div className="success-banner">
                🎉 Loyalty Reward Applied
                <br />
                You are qualified for a FREE bin hire.
                <br />
                Only waste, delivery and extension charges apply.
              </div>
            )}
            {!pricing?.free_bin && (
              <div className="promo-banner">🎁 Every 7th Bin Hire FREE</div>
            )}

            <h2>ORDER SUMMARY</h2>
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
              <span>{pricing.distance_km || 0} km</span>
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
              disabled={submitting || pricing.total === 0}
            >
              {submitting ? "Processing..." : "COMPLETE BOOKING"}
            </button>

            {loyalty && (
              <div className="loyalty-card">
                <h3>🎁 Loyalty Rewards</h3>
                <p>
                  {loyalty.progress} / 7 — {loyalty.bins_until_free} more bin
                  {loyalty.bins_until_free !== 1 ? "s" : ""} until your next
                  free hire!
                </p>
                <div className="loyalty-progress">
                  <div
                    className="loyalty-fill"
                    style={{
                      width: `${(loyalty.progress / 7) * 100}%`,
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
