import React, {
  useEffect,
  useState
} from "react";

import DashboardLayout
from "../layouts/DashboardLayout";

import api
from "../services/api";

const Bins = () => {

  const [bins,
  setBins] =
  useState([]);

  const [form,
  setForm] =
  useState({

    size:"",
    base_price:""

  });

  useEffect(()=>{

    fetchBins();

  },[]);

  const fetchBins =
  async()=>{

    try{

      const res =
      await api.get(
        "/bins"
      );

      setBins(
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

  const addBin =
  async(e)=>{

    e.preventDefault();

    try{

      await api.post(
        "/bins",
        form
      );

      setForm({

        size:"",
        base_price:""

      });

      fetchBins();

    }catch(err){

      console.log(err);

    }

  };

  const deleteBin =
  async(id)=>{

    if(
      !window.confirm(
      "Delete bin?"
      )
    ) return;

    try{

      await api.delete(
        `/bins/${id}`
      );

      fetchBins();

    }catch(err){

      console.log(err);

    }

  };

  return(

    <DashboardLayout>

      <h1
      className="page-title"
      >
        Bin Management
      </h1>

      <div
      className="stat-card"
      >

        <h3>
          Add Bin
        </h3>

        <br/>

        <form
        onSubmit={addBin}
        >

          <input
            type="text"
            name="size"
            placeholder="2m³"
            value={form.size}
            onChange={
              handleChange
            }
          />

          <br/><br/>

          <input
            type="number"
            name="base_price"
            placeholder="Base Price"
            value={
              form.base_price
            }
            onChange={
              handleChange
            }
          />

          <br/><br/>

          <button
          type="submit"
          >
            Add Bin
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

              <th>Size</th>

              <th>Base Price</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {
              bins.map(
              (bin)=>(

                <tr
                key={
                  bin.bin_id
                }
                >

                  <td>
                    {bin.bin_id}
                  </td>

                  <td>
                    {bin.size}
                  </td>

                  <td>
                    $
                    {bin.base_price}
                  </td>

                  <td>

                    <button
                    onClick={()=>
                    deleteBin(
                      bin.bin_id
                    )}
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

export default Bins;