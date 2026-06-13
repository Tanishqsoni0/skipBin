import { useState } from "react";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import api from "../services/api";
import "../contact.css";

const Contact = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
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

    try {

      const res = await api.post(
        "/contact",
        form
      );

      setSuccess(res.data.message);
      setError("");
      setForm({
        name: "",
        email: "",
        message: ""
      });

    } catch (err) {
      setSuccess("");
      setError("Failed to send message.");

      console.log(err);

    }

  };

  return (

    <>

      <WebsiteNavbar />

      <div className="contact-page">

        <div className="contact-hero">

          <h1>
            Get In Touch
          </h1>

          <p>
            Need a skip bin? Have questions about pricing,
            waste types or delivery? We're here to help.
          </p>

        </div>

        <div className="contact-card">

          <div className="contact-container">

            {/* LEFT */}

            <div className="contact-info">

              <h2>
                Contact Information
              </h2>

              <div className="contact-info-item">

                <span>📞</span>

                <div>
                  <h4>Phone</h4>
                  <p>+61 XXX XXX XXX</p>
                </div>

              </div>

              <div className="contact-info-item">

                <span>✉️</span>

                <div>
                  <h4>Email</h4>
                  <p>info@jerrysbins.com</p>
                </div>

              </div>

              <div className="contact-info-item">

                <span>🕒</span>

                <div>
                  <h4>Business Hours</h4>
                  <p>Mon - Sat, 8 AM - 6 PM</p>
                </div>

              </div>

              <div className="contact-info-item">

                <span>📍</span>

                <div>
                  <h4>Service Area</h4>
                  <p>Greater Sydney Region</p>
                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div className="contact-form">

              <h2>
                Send Us A Message
              </h2>

              {success && (
                <div className="contact-success">
                  {success}
                </div>
              )}

              {error && (
                <div className="contact-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="message"
                  placeholder="How can we help you?"
                  value={form.message}
                  onChange={handleChange}
                  required
                />

                <button
                  className="contact-btn"
                  type="submit"
                >
                  📩 Send Message
                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

      <Footer />

    </>

  );

};

export default Contact;