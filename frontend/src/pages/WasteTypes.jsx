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

    }catch(err){

      console.log(err);

    }

  };

  return(

    <DashboardLayout>

      <h1
      className="page-title"
      >
        Waste Types
      </h1>

      <div
      className="stat-card"
      >

        <h3>
          Add Waste Type
        </h3>

        <br/>

        <form
        onSubmit={
          addWasteType
        }
        >

          <input
            type="text"
            name="waste_name"
            placeholder="Wood"
            value={
              form.waste_name
            }
            onChange={
              handleChange
            }
          />

          <br/><br/>

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
          />

          <br/><br/>

          <button
          type="submit"
          >
            Add Waste Type
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

              <th>Waste Type</th>

              <th>Extra Charge</th>

            </tr>

          </thead>

          <tbody>

            {
              wasteTypes.map(
              (waste)=>(

                <tr
                key={
                  waste.waste_id
                }
                >

                  <td>
                    {waste.waste_id}
                  </td>

                  <td>
                    {waste.waste_name}
                  </td>

                  <td>
                    $
                    {waste.extra_charge}
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