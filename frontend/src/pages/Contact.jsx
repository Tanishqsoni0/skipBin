import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";

const Contact = () => {

  return (

    <>

      <WebsiteNavbar />

      <div className="contact-page">

        <div className="contact-card">

          <h1>
            Contact Us
          </h1>

          <br />

          <p>
            Phone: +61 XXX XXX XXX
          </p>

          <p>
            Email: info@jerrysbins.com
          </p>

          <br />

          <input
            type="text"
            placeholder="Name"
          />

          <br /><br />

          <input
            type="email"
            placeholder="Email"
          />

          <br /><br />

          <textarea
            placeholder="Message"
          />

          <br /><br />

          <button>
            Send Message
          </button>

        </div>

      </div>

      <Footer />

    </>

  );

};

export default Contact;