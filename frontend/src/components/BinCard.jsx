import {useNavigate} from "react-router-dom";
const BinCard = ({ bin_id, size, price }) => {
  const capacity = parseInt(size) * 10;
  const navigate = useNavigate();
  const handleBooking = () => {
    navigate(`/booking?bin=${encodeURIComponent(bin_id)}`);
  };

  return (
    <div className="bin-card">

      <div className="card-preview">

        <div className="card-inner">

          {/* FRONT */}

          <div className="card-front">

            <div className="bin-icon">
              🚛
            </div>

            <h2>{size}</h2>

            <div className="bin-price">
              ${price}
            </div>

            <span className="hire-text">
              Per Week Hire
            </span>

          </div>

          {/* BACK */}

          <div className="card-back">

            <h3>Suitable Waste Types</h3>

            <ul>
              <li>General Waste</li>
              <li>Green Waste</li>
              <li>Household Waste</li>
              <li>Renovation Waste</li>
            </ul>

            <div className="capacity-box">
              Capacity: {capacity} wheelie bins
            </div>

          </div>

        </div>

      </div>

      <button
        className="book-btn"
        onClick={handleBooking}
      >
        Book Now
      </button>

    </div>
  );
};

export default BinCard;