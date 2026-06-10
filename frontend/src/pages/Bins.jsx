import React,{useEffect,useState} from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const Bins=()=>{

  const [bins,setBins]=useState([]);

  const [form,setForm]=useState({
    size:"",
    base_price:""
  });

  const [editingId,setEditingId]=useState(null);

  const [editForm,setEditForm]=useState({
    size:"",
    base_price:""
  });

  useEffect(()=>{

    fetchBins();

  },[]);

  const fetchBins=async()=>{

    try{

      const res=
      await api.get("/bins");

      setBins(res.data);

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

  const addBin=async(e)=>{

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

    }
    catch(err){

      console.log(err);

    }

  };

  const deleteBin=async(id)=>{

    if(
      !window.confirm(
        "Delete Bin?"
      )
    ) return;

    try{

      await api.delete(
        `/bins/${id}`
      );

      fetchBins();

    }
    catch(err){

      console.log(err);

    }

  };

  const updateBin=async(id)=>{

    try{

      await api.put(
        `/bins/${id}`,
        editForm
      );

      setEditingId(null);

      fetchBins();

    }
    catch(err){

      console.log(err);

    }

  };

  return(

    <DashboardLayout>

      <div className="page-header">

  <h1>
    Bin Management
  </h1>

  <p>
    Manage skip bin sizes and pricing used in bookings.
  </p>

</div>

      <div className="pricing-card">

  <h2 className="pricing-card-title">
    Add Bin
  </h2>

  <form
    className="pricing-form"
    onSubmit={addBin}
  >

    <input
      type="text"
      name="size"
      placeholder="Bin Size"
      value={form.size}
      onChange={handleChange}
      required
    />

    <input
      type="number"
      name="base_price"
      placeholder="Base Price"
      value={form.base_price}
      onChange={handleChange}
      required
    />

    <button
      type="submit"
      className="pricing-btn"
    >
      Add Bin
    </button>

  </form>

</div>

      <div className="stat-card">

        <h2>
          Bin Pricing
        </h2>

        <table>

          <thead>

            <tr>

              <th>ID</th>
              <th>Size</th>
              <th>Base Price</th>
              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {bins.map((bin)=>(

              <tr key={bin.bin_id}>

                <td>
                  {bin.bin_id}
                </td>

                <td>

                  {
                  editingId===bin.bin_id ?

                  <input
                    value={editForm.size}
                    onChange={(e)=>
                    setEditForm({
                      ...editForm,
                      size:e.target.value
                    })}
                  />

                  :

                  bin.size
                  }

                </td>

                <td>

                  {
                  editingId===bin.bin_id ?

                  <input
                    type="number"
                    value={editForm.base_price}
                    onChange={(e)=>
                    setEditForm({
                      ...editForm,
                      base_price:e.target.value
                    })}
                  />

                  :

                  `$${bin.base_price}`
                  }

                </td>

                <td>

                  {
                  editingId===bin.bin_id ?

                  <>

                    <button
                      className="edit-btn"
                      onClick={()=>
                      updateBin(
                        bin.bin_id
                      )}
                    >
                      Save
                    </button>

                    <button
                      className="delete-btn"
                      onClick={()=>
                      setEditingId(null)
                      }
                    >
                      Cancel
                    </button>

                  </>

                  :

                  <>

                    <button
                      className="edit-btn"
                      onClick={()=>{
                        setEditingId(
                          bin.bin_id
                        );

                        setEditForm({
                          size:bin.size,
                          base_price:
                          bin.base_price
                        });
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={()=>
                      deleteBin(
                        bin.bin_id
                      )}
                    >
                      Delete
                    </button>

                  </>

                  }

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>

  );

};

export default Bins;