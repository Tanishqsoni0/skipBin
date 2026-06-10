import React, {
  useEffect,
  useState
} from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import api
from "../services/api";

const WasteTypes = () => {

  const [wasteTypes,
  setWasteTypes] =
  useState([]);

  const [editing,
  setEditing] =
  useState(null);

  const [form,
  setForm] =
  useState({

    waste_name:"",
    extra_charge:""

  });

  useEffect(()=>{

    fetchWasteTypes();

  },[]);

  const fetchWasteTypes =
  async()=>{

    try{

      const res =
      await api.get(
        "/waste-types"
      );

      setWasteTypes(
        res.data
      );

    }
    catch(err){

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

  const addWasteType =
  async(e)=>{

    e.preventDefault();

    try{

      await api.post(
        "/waste-types",
        form
      );

      setForm({

        waste_name:"",
        extra_charge:""

      });

      fetchWasteTypes();

    }
    catch(err){

      console.log(err);

    }

  };

  const editWaste =
  (item)=>{

    setEditing(
      item.waste_id
    );

    setForm({

      waste_name:
      item.waste_name,

      extra_charge:
      item.extra_charge

    });

  };

  const updateWaste =
  async(id)=>{

    try{

      await api.put(

        `/waste-types/${id}`,

        form

      );

      setEditing(null);

      setForm({

        waste_name:"",
        extra_charge:""

      });

      fetchWasteTypes();

    }
    catch(err){

      console.log(err);

    }

  };

  const deleteWaste =
  async(id)=>{

    if(
      !window.confirm(
        "Delete waste type?"
      )
    ) return;

    try{

      await api.delete(
        `/waste-types/${id}`
      );

      fetchWasteTypes();

    }
    catch(err){

      console.log(err);

    }

  };

  return(

    <DashboardLayout>

      <div className="page-header">

        <h1>
          Waste Pricing
        </h1>

        <p>
          Manage waste surcharges used in booking calculations.
        </p>

      </div>

      <div className="pricing-card">

        <h2 className="pricing-card-title">
          Add Waste Type
        </h2>

        <form
          onSubmit={
            addWasteType
          }
          className="pricing-form"
        >

          <input
            type="text"
            name="waste_name"
            placeholder="Waste Type"
            value={
              form.waste_name
            }
            onChange={
              handleChange
            }
            required
          />

          <input
            type="number"
            name="extra_charge"
            placeholder="Extra Charge"
            value={
              form.extra_charge
            }
            onChange={
              handleChange
            }
            required
          />

          <button
            type="submit"
          >
            Add Waste Type
          </button>

        </form>

      </div>

      <div className="pricing-table-card">

        <div className="table-header">

          <h2>
            Waste Surcharges
          </h2>

        </div>

        <table className="pricing-table">

          <thead>

            <tr>

              <th>ID</th>

              <th>Waste Type</th>

              <th>Extra Charge</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {
              wasteTypes.map(
              item=>(

                <tr
                  key={
                    item.waste_id
                  }
                >

                  <td>
                    {item.waste_id}
                  </td>

                  <td>

                    {
                      editing ===
                      item.waste_id ?

                      <input
                        name="waste_name"
                        value={
                          form.waste_name
                        }
                        onChange={
                          handleChange
                        }
                      />

                      :

                      item.waste_name
                    }

                  </td>

                  <td>

                    {
                      editing ===
                      item.waste_id ?

                      <input
                        name="extra_charge"
                        value={
                          form.extra_charge
                        }
                        onChange={
                          handleChange
                        }
                      />

                      :

                      `$${item.extra_charge}`
                    }

                  </td>

                  <td>

                    {
                      editing ===
                      item.waste_id ?

                      <button
                        className="save-btn"
                        onClick={()=>
                          updateWaste(
                            item.waste_id
                          )
                        }
                      >
                        Save
                      </button>

                      :

                      <button
                        className="edit-btn"
                        onClick={()=>
                          editWaste(item)
                        }
                      >
                        Edit
                      </button>
                    }

                    <button
                      className="delete-btn"
                      onClick={()=>
                        deleteWaste(
                          item.waste_id
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

export default WasteTypes;