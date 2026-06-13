import { useState } from "react";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import api from "../services/api";
import "../commercial.css";

const CommercialQuote = () => {

  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    project_location: "",
    bin_size: "",
    waste_type: "",
    requirements: ""
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setSuccess("");
    setError("");

    try {

      const res = await api.post(
        "/commercial-quotes",
        form
      );

      setSuccess(res.data.message);

      setForm({
        company_name: "",
        contact_person: "",
        email: "",
        phone: "",
        project_location: "",
        bin_size: "",
        waste_type: "",
        requirements: ""
      });

    } catch(err) {

      setError(
        err.response?.data?.message ||
        "Failed to submit quote request."
      );

      console.log(err);

    }

  };

  return (
    <>
      <WebsiteNavbar />

      <div className="quote-page">

        <div className="quote-card">

          <h1>
            Commercial Quote Request
          </h1>

          <p className="quote-subtitle">
            Tell us about your project and our team
            will prepare a customised commercial quote.
          </p>

          {success && (
            <div className="quote-success">
              {success}
            </div>
          )}

          {error && (
            <div className="quote-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="company_name"
              placeholder="Company Name"
              value={form.company_name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="contact_person"
              placeholder="Contact Person"
              value={form.contact_person}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Business Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="project_location"
              placeholder="Project Location"
              value={form.project_location}
              onChange={handleChange}
              required
            />

            <select
              name="bin_size"
              value={form.bin_size}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Bin Size
              </option>

              <option value="2m3">
                2m³ Skip Bin
              </option>

              <option value="3m3">
                3m³ Skip Bin
              </option>

              <option value="4m3">
                4m³ Skip Bin
              </option>

              <option value="6m3">
                6m³ Skip Bin
              </option>

              <option value="8m3">
                8m³ Skip Bin
              </option>

              <option value="10m3"> 
                10m³ Skip Bin
              </option>

            </select>

            <select
              name="waste_type"
              value={form.waste_type}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Waste Type
              </option>

              <option value="General Waste">
                General Waste
              </option>

              <option value="Green Waste">
                Green Waste
              </option>

              <option value="Construction Waste">
                Construction Waste
              </option>

              <option value="Mixed Waste">
                Mixed Waste
              </option>

            </select>

            <textarea
              name="requirements"
              placeholder="Describe your project requirements..."
              value={form.requirements}
              onChange={handleChange}
              rows="6"
              required
            />

            <button
              type="submit"
              className="quote-btn"
            >
              Submit Quote Request
            </button>

          </form>

        </div>

      </div>

      <Footer />
    </>
  );

};

export default CommercialQuote;