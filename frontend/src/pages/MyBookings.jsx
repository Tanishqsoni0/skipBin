import React, { useEffect, useState } from "react";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import api from "../services/api";
import { fetchMe, invalidateMeCache } from "../services/authService";
import "../booking.css";

const MyBookings = () => {

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadBookings();

  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      invalidateMeCache(); // ← force fresh loyalty count
      const me = await fetchMe();

      if (!me.success) {
        setLoading(false);
        return;
      }

      const res = await api.get(`/my-bookings/${me.customer.customer_id}`);
      setBookings(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {

    switch (status) {

      case "CONFIRMED":
        return "status-confirmed";

      case "ACTIVE":
        return "status-active";

      case "COLLECTION_DUE":
        return "status-due";

      case "COMPLETED":
        return "status-completed";

      default:
        return "status-new";
    }

  };

  return (
    <>
      <WebsiteNavbar />

      <div className="booking-page">
        <div
          style={{
            maxWidth: "1200px",
            margin: "auto",
          }}
        >
          <div className="booking-card">
            <h1>My Bookings</h1>

            <p className="booking-subtitle">View all your skip bin bookings</p>

            <button
              className="calculate-btn"
              onClick={loadBookings}
              style={{ marginBottom: "1.5rem" }}
            >
              🔄 Refresh Bookings
            </button>

            {loading ? (
              <p>Loading...</p>
            ) : bookings.length === 0 ? (
              <p>No bookings found.</p>
            ) : (
              <div className="my-bookings-grid">
                {bookings.map((booking) => (
                  <div key={booking.booking_id} className="my-booking-card">
                    <div className="booking-card-top">
                      <h3>Booking #{booking.booking_id}</h3>

                      <span
                        className={`booking-status ${getStatusClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="booking-info">
                      <p>
                        <strong>Bin:</strong> {booking.size}
                      </p>

                      <p>
                        <strong>Waste:</strong> {booking.waste_name}
                      </p>

                      <p>
                        <strong>Delivery:</strong>{" "}
                        {new Date(booking.delivery_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>

                      <p>
                        <strong>Collection:</strong>{" "}
                        {new Date(booking.collection_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>

                    <div className="booking-total">${booking.total_amount}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default MyBookings;