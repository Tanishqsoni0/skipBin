import { Link }
from "react-router-dom";

const HeroSection = () => {

  return (

    <div
      style={{
        minHeight:"80vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"column",
        background:
        "linear-gradient(135deg,#0f172a,#1e293b)",
        color:"white",
        textAlign:"center"
      }}
    >

      <h1
      style={{
        fontSize:"4rem"
      }}
      >
        Jerry's Bins
      </h1>

      <br/>

      <h2>
        Premium Skip Bin Hire
      </h2>

      <br/>

      <p>
        Fast Delivery.
        Competitive Pricing.
        Every 7th Bin Free.
      </p>

      <br/>

      <Link
      to="/booking"
      >

        <button>

          Book A Bin

        </button>

      </Link>

    </div>

  );

};

export default HeroSection;