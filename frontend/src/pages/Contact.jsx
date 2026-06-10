import { useState } from "react";
import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";
import api from "../services/api";

const Contact = () => {

  const [form,setForm] =
  useState({
    name:"",
    email:"",
    message:""
  });

  const handleChange = (e)=>{

    setForm({

      ...form,

      [e.target.name]:
      e.target.value

    });

  };

  const handleSubmit =
  async(e)=>{

    e.preventDefault();

    try{

      const res =
      await api.post(
        "/contact",
        form
      );

      alert(
        res.data.message
      );

      setForm({
        name:"",
        email:"",
        message:""
      });

    }catch(err){

      alert(
        "Failed to send message"
      );

      console.log(err);

    }

  };

  return (

    <>

      <WebsiteNavbar />

      <div className="contact-page">

        <div className="contact-card">

          <h1>Contact Us</h1>

          <br />

          <p>
            Phone: +61 XXX XXX XXX
          </p>

          <p>
            Email: info@jerrysbins.com
          </p>

          <br />

          <form
          onSubmit={
            handleSubmit
          }
          >

            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <br /><br />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <br /><br />

            <textarea
              name="message"
              placeholder="Message"
              value={form.message}
              onChange={handleChange}
              required
            />

            <br /><br />

            <button className="edit-btn"
            type="submit"
            >
              Send Message
            </button>

          </form>

        </div>

      </div>

      <Footer />

    </>

  );

};

export default Contact;