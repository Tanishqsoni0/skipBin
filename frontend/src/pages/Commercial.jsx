import { useNavigate } from "react-router-dom";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import "../commercial.css";
const Commercial = () => {

  const navigate = useNavigate();

  return (
    <>
      <WebsiteNavbar />

      <div className="commercial-page">

        {/* Hero Section */}
        <div className="commercial-hero">

          <div className="commercial-content">

            <h1>
              Reliable Skip Bin Services For Businesses
            </h1>

            <p>
              Flexible waste management solutions for construction sites,
              builders, developers, warehouses and commercial projects
              across Sydney.
            </p>

            <div className="commercial-actions">

              <button
                className="quote-btn"
                onClick={() => navigate("/commercial-quotes")}
              >
                Request A Quote
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate("/booking")}
              >
                Book A Bin
              </button>

            </div>

          </div>

        </div>

        {/* Features */}
        <div className="commercial-features">

          <div className="feature-card">
            <h3>📅 Long-Term Hire</h3>
            <p>
              Flexible contracts for ongoing commercial projects.
            </p>
          </div>

          <div className="feature-card">
            <h3>🚚 Fast Collection</h3>
            <p>
              Reliable deliveries and priority collection service.
            </p>
          </div>

          <div className="feature-card">
            <h3>💰 Custom Pricing</h3>
            <p>
              Tailored pricing plans for business customers.
            </p>
          </div>

        </div>

        {/* Stats */}
        <div className="commercial-stats">

          <div className="start-card">
            <h2>500+</h2>
            <p>Commercial Projects</p>
          </div>

          <div className="start-card">
            <h2>24/7</h2>
            <p>Support</p>
          </div>

          <div className="start-card">
            <h2>98%</h2>
            <p>Customer Satisfaction</p>
          </div>

          <div className="start-card">
            <h3>Same Day</h3>
            <p>Delivery Available</p>
          </div>

        </div>

        {/* CTA */}
        <div className="commercial-cta">

          <h2>
            Need A Custom Waste Management Plan?
          </h2>

          <p>
            Contact our commercial team for tailored pricing and
            long-term hire options.
          </p>

          <button
            className="quote-btn"
            onClick={() => navigate("/commercial-quotes")}
          >
            Get Commercial Quote
          </button>

        </div>

      </div>

      <Footer />
    </>
  );
};

export default Commercial;