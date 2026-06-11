import React,{useEffect,useState} from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const Promotions=()=>{

  const [promotions,setPromotions]=useState([]);

  const [editing,setEditing]=useState(null);

  const [form,setForm]=useState({
    promo_name:"",
    discount_type:"PERCENTAGE",
    discount_value:"",
    start_date:"",
    end_date:"",
    active:true
  });

  useEffect(()=>{

    fetchPromotions();

  },[]);

  const fetchPromotions=async()=>{

    try{

      const res=await api.get("/promotions");

      setPromotions(res.data);

    }
    catch(err){

      console.log(err);

    }

  };

  const handleChange=(e)=>{

    setForm({

      ...form,

      [e.target.name]:
      e.target.value

    });

  };

  const resetForm=()=>{

    setForm({

      promo_name:"",
      discount_type:"PERCENTAGE",
      discount_value:"",
      start_date:"",
      end_date:"",
      active:true

    });

  };

  const addPromotion=async(e)=>{

    e.preventDefault();

    try{

      await api.post(
        "/promotions",
        form
      );

      resetForm();

      fetchPromotions();

    }
    catch(err){

      console.log(err);

    }

  };

  const editPromotion=(item)=>{

    setEditing(
      item.promo_id
    );

    setForm({

      promo_name:
      item.promo_name,

      discount_type:
      item.discount_type,

      discount_value:
      item.discount_value,

      start_date:
      item.start_date?.split("T")[0],

      end_date:
      item.end_date?.split("T")[0],

      active:
      item.active

    });

  };

  const updatePromotion=async(id)=>{

    try{

      await api.put(
        `/promotions/${id}`,
        form
      );

      setEditing(null);

      resetForm();

      fetchPromotions();

    }
    catch(err){

      console.log(err);

    }

  };

  const deletePromotion=async(id)=>{

    if(
      !window.confirm(
        "Delete Promotion?"
      )
    ) return;

    try{

      await api.delete(
        `/promotions/${id}`
      );

      fetchPromotions();

    }
    catch(err){

      console.log(err);

    }

  };

  return(

    <DashboardLayout>

      <div className="page-header">

        <h1>
          Promotions
        </h1>

        <p>
          Manage discounts, offers and seasonal promotions.
        </p>

      </div>

      <div className="pricing-card">

        <h2 className="pricing-card-title">
          Create Promotion
        </h2>

        <form
          onSubmit={addPromotion}
          className="pricing-form"
        >

          <input
            type="text"
            name="promo_name"
            placeholder="Promotion Name"
            value={form.promo_name}
            onChange={handleChange}
            required
          />

          <select
            name="discount_type"
            value={form.discount_type}
            onChange={handleChange}
          >

            <option value="PERCENTAGE">
              Percentage
            </option>

            <option value="FIXED">
              Fixed Amount
            </option>

          </select>

          <input
            type="number"
            name="discount_value"
            placeholder="Discount Value"
            value={form.discount_value}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Add Promotion
          </button>

        </form>

      </div>

      <div className="pricing-table-card">

        <div className="table-header">

          <h2>
            Active Promotions
          </h2>

        </div>

        <table className="pricing-table">

          <thead>

            <tr>

              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {
              promotions.map(item=>(

                <tr
                  key={item.promo_id}
                >

                  <td>
                    {item.promo_id}
                  </td>

                  <td>

                    {
                      editing===item.promo_id ?

                      <input
                        name="promo_name"
                        value={form.promo_name}
                        onChange={handleChange}
                      />

                      :

                      item.promo_name
                    }

                  </td>

                  <td>

                    {
                      editing===item.promo_id ?

                      <select
                        name="discount_type"
                        value={form.discount_type}
                        onChange={handleChange}
                      >

                        <option value="PERCENTAGE">
                          Percentage
                        </option>

                        <option value="FIXED">
                          Fixed
                        </option>

                      </select>

                      :

                      item.discount_type
                    }

                  </td>

                  <td>

                    {
                      editing===item.promo_id ?

                      <input
                        type="number"
                        name="discount_value"
                        value={form.discount_value}
                        onChange={handleChange}
                      />

                      :

                      item.discount_type==="PERCENTAGE"

                      ?

                      `${item.discount_value}%`

                      :

                      `$${item.discount_value}`
                    }

                  </td>

                  <td>

                    {
                      editing===item.promo_id ?

                      <input
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                      />

                      :

                      new Date(item.start_date)
                      .toLocaleDateString(
                        "en-GB",
                        {
                          day:"2-digit",
                          month:"short",
                          year:"numeric"
                        }
                      )
                    }

                  </td>

                  <td>

                    {
                      editing===item.promo_id ?

                      <input
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                      />

                      :

                      new Date(item.end_date)
                      .toLocaleDateString(
                        "en-GB",
                        {
                          day:"2-digit",
                          month:"short",
                          year:"numeric"
                        }
                      )
                    }

                  </td>

                  <td>

                    {
                      editing===item.promo_id ?

                      <select
                        value={form.active}
                        onChange={(e)=>
                          setForm({
                            ...form,
                            active:
                            e.target.value==="true"
                          })
                        }
                      >

                        <option value="true">
                          Active
                        </option>

                        <option value="false">
                          Inactive
                        </option>

                      </select>

                      :

                      item.active
                      ? "Active"
                      : "Inactive"
                    }

                  </td>

                  <td>

                    {
                      editing===item.promo_id ?

                      <button
                        className="save-btn"
                        onClick={()=>
                          updatePromotion(
                            item.promo_id
                          )
                        }
                      >
                        Save
                      </button>

                      :

                      <button
                        className="edit-btn"
                        onClick={()=>
                          editPromotion(item)
                        }
                      >
                        Edit
                      </button>
                    }

                    <button
                      className="delete-btn"
                      onClick={()=>
                        deletePromotion(
                          item.promo_id
                        )
                      }
                    >
                      Delete
                    </button>

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