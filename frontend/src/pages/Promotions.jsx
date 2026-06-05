import React, {
  useEffect,
  useState
} from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import api
from "../services/api";

const Promotions = () => {

  const [promotions,
  setPromotions] =
  useState([]);

  const [form,
  setForm] =
  useState({

    promo_name:"",
    discount_type:"PERCENTAGE",
    discount_value:"",
    start_date:"",
    end_date:""

  });

  useEffect(()=>{

    fetchPromotions();

  },[]);

  const fetchPromotions =
  async()=>{

    try{

      const res =
      await api.get(
        "/promotions"
      );

      setPromotions(
        res.data
      );

    }catch(err){

      console.log(err);

    }

  };

  const handleChange =
  (e)=>{

    setForm({

      ...form,

      [e.target.name]:
      e.target.value

    });

  };

  const addPromotion =
  async(e)=>{

    e.preventDefault();

    try{

      await api.post(
        "/promotions",
        form
      );

      setForm({

        promo_name:"",
        discount_type:"PERCENTAGE",
        discount_value:"",
        start_date:"",
        end_date:""

      });

      fetchPromotions();

    }catch(err){

      console.log(err);

    }

  };

  return(

    <DashboardLayout>

      <h1
      className="page-title"
      >
        Promotions
      </h1>

      <div
      className="stat-card"
      >

        <h3>
          Create Promotion
        </h3>

        <br/>

        <form
        onSubmit={
          addPromotion
        }
        >

          <input
            type="text"
            name="promo_name"
            placeholder="Summer Sale"
            value={
              form.promo_name
            }
            onChange={
              handleChange
            }
          />

          <br/><br/>

          <select
            name="discount_type"
            value={
              form.discount_type
            }
            onChange={
              handleChange
            }
          >

            <option
            value="PERCENTAGE"
            >
              Percentage
            </option>

            <option
            value="FIXED"
            >
              Fixed Amount
            </option>

          </select>

          <br/><br/>

          <input
            type="number"
            name="discount_value"
            placeholder="Discount Value"
            value={
              form.discount_value
            }
            onChange={
              handleChange
            }
          />

          <br/><br/>

          <input
            type="date"
            name="start_date"
            value={
              form.start_date
            }
            onChange={
              handleChange
            }
          />

          <br/><br/>

          <input
            type="date"
            name="end_date"
            value={
              form.end_date
            }
            onChange={
              handleChange
            }
          />

          <br/><br/>

          <button
          type="submit"
          >
            Create Promotion
          </button>

        </form>

      </div>

      <br/>

      <div
      className="table-container"
      >

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Name</th>

              <th>Type</th>

              <th>Value</th>

              <th>Start</th>

              <th>End</th>

            </tr>

          </thead>

          <tbody>

            {
              promotions.map(
              (promo)=>(

                <tr
                key={
                  promo.promo_id
                }
                >

                  <td>
                    {promo.promo_id}
                  </td>

                  <td>
                    {promo.promo_name}
                  </td>

                  <td>
                    {
                      promo.discount_type
                    }
                  </td>

                  <td>
                    {
                      promo.discount_value
                    }
                  </td>

                  <td>
                    {
                      promo.start_date
                    }
                  </td>

                  <td>
                    {
                      promo.end_date
                    }
                  </td>

                </tr>

              ))
            }

          </tbody>

        </table>

      </div>

    </DashboardLayout>

  );

};

export default Promotions;