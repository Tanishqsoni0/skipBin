import WebsiteNavbar from "../components/WebsiteNavbar";
import Footer from "../components/Footer";

const Commercial = () => {

  return (

    <>

      <WebsiteNavbar />

      <div className="commercial-page">

        <div className="commercial-card">

          <h1>
            Commercial Skip Bin Hire
          </h1>

          <br />

          <p>
            We provide reliable skip bin
            services for builders,
            construction companies,
            developers and ongoing projects.
          </p>

          <br />

          <ul>

            <li>
              Long-Term Bin Hire
            </li>

            <li>
              Construction Site Waste
            </li>

            <li>
              Scheduled Pickups
            </li>

            <li>
              Custom Pricing Plans
            </li>

            <li>
              Priority Service
            </li>

          </ul>

          <br />

          <button>
            Request Commercial Quote
          </button>

        </div>

      </div>

      <Footer />

    </>

  );

};

export default Commercial;