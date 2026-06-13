// components/PromoBanner.jsx
// Fetches and displays currently active promotions.
// Use on Homepage and BookingWebsite.
// Shows nothing if there are no active promotions.

import { useState, useEffect } from "react";
import api from "../services/api";
import "../PromoBanner.css";

export default function PromoBanner() {
  const [promotions, setPromotions] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get("/promotions/active")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setPromotions(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-rotate if multiple promotions
  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promotions.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [promotions]);

  if (promotions.length === 0) return null;

  const promo = promotions[current];

  const discountLabel =
    promo.discount_type === "PERCENTAGE"
      ? `${promo.discount_value}% OFF`
      : `$${promo.discount_value} OFF`;

  const endDate = new Date(promo.end_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="promo-banner-strip">
      <div className="promo-banner-inner">
        <span className="promo-tag">🔥 LIMITED OFFER</span>
        <span className="promo-name">{promo.promo_name}</span>
        <span className="promo-discount">{discountLabel}</span>
        <span className="promo-expiry">Ends {endDate}</span>

        {/* Dots for multiple promos */}
        {promotions.length > 1 && (
          <div className="promo-dots">
            {promotions.map((_, i) => (
              <span
                key={i}
                className={`promo-dot ${i === current ? "active" : ""}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
