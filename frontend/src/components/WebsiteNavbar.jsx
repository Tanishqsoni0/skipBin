import { Link } from "react-router-dom";

const WebsiteNavbar = () => {

  return (

    <nav className="website-navbar">

      <div className="brand">
        Jerry's Bins
      </div>

      <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/booking">
          Book Bin
        </Link>

        <Link to="/commercial">
          Commercial
        </Link>

        <Link to="/contact">
          Contact
        </Link>

        <Link to="/login">
          Admin
        </Link>

      </div>

    </nav>

  );

};

export default WebsiteNavbar;