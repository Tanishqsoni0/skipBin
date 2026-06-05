const BinCard = ({
  size,
  price
}) => {

  return (

    <div className="bin-card">

      <h2>
        {size}
      </h2>

      <p>
        From ${price}
      </p>

      <button>
        Book Now
      </button>

    </div>

  );

};

export default BinCard;