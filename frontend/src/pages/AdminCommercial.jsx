import React,{useEffect,useState} from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const AdminCommercial=()=>{

  const [quotes,setQuotes]=useState([]);

  const [selectedQuote,setSelectedQuote]=
  useState(null);

  useEffect(()=>{

    fetchQuotes();

  },[]);

  const fetchQuotes=async()=>{

    try{

      const res=
      await api.get(
        "/admin/commercial"
      );

      setQuotes(res.data);

    }
    catch(err){

      console.log(err);

    }

  };

  const updateStatus = async(id,status)=>{

  try{

    await api.put(
      `/admin/commercial/${id}`,
      {status}
    );

    fetchQuotes();

  }
  catch(err){

    console.log(err);

  }

};

  return(

    <DashboardLayout>

      <div className="page-header">

        <h1>
          Commercial Quotes
        </h1>

        <p>
          Manage commercial quote requests submitted by businesses.
        </p>

      </div>

      <div className="stat-card">

        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            marginBottom:"20px"
          }}
        >

          <h2>
            Quote Requests
          </h2>

          <button
            className="pricing-btn"
            onClick={fetchQuotes}
          >
            Refresh
          </button>

        </div>

        <table>

          <thead>

            <tr>

              <th>ID</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Bin</th>
              <th>Waste</th>
              <th>Status</th>
              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {quotes.map((q)=>(

              <tr key={q.quote_id}>

                <td>
                  {q.quote_id}
                </td>

                <td>
                  {q.company_name}
                </td>

                <td>
                  {q.contact_person}
                </td>

                <td>
                  {q.bin_size}
                </td>

                <td>
                  {q.waste_type}
                </td>

                <td>

<select
  value={q.status}
  onChange={(e)=>
    updateStatus(
      q.quote_id,
      e.target.value
    )
  }
>

  <option value="NEW">
    NEW
  </option>

  <option value="CONTACTED">
    CONTACTED
  </option>

  <option value="QUOTED">
    QUOTED
  </option>

  <option value="APPROVED">
    APPROVED
  </option>

  <option value="REJECTED">
    REJECTED
  </option>

</select>

</td>

                <td>

                  <button
                    className="edit-btn"
                    onClick={()=>
                    setSelectedQuote(q)
                    }
                  >
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {selectedQuote && (

<div className="quote-details-card">

  <div className="quote-details-header">

    <h2>
      Commercial Quote Details
    </h2>

    <button
      className="delete-btn"
      onClick={() => setSelectedQuote(null)}
    >
      Close
    </button>

  </div>

  <div className="quote-grid">

    <div className="quote-item">
      <label>Company</label>
      <span>{selectedQuote.company_name}</span>
    </div>

    <div className="quote-item">
      <label>Contact Person</label>
      <span>{selectedQuote.contact_person}</span>
    </div>

    <div className="quote-item">
      <label>Email</label>
      <span>{selectedQuote.email}</span>
    </div>

    <div className="quote-item">
      <label>Phone</label>
      <span>{selectedQuote.phone}</span>
    </div>

    <div className="quote-item">
      <label>Project Location</label>
      <span>{selectedQuote.project_location}</span>
    </div>

    <div className="quote-item">
      <label>Bin Size</label>
      <span>{selectedQuote.bin_size}</span>
    </div>

    <div className="quote-item">
      <label>Waste Type</label>
      <span>{selectedQuote.waste_type}</span>
    </div>

    <div className="quote-item">
      <label>Status</label>
      <span>{selectedQuote.status}</span>
    </div>

  </div>

  <div className="requirements-box">

    <h3>
      Project Requirements
    </h3>

    <p>
      {selectedQuote.requirements}
    </p>

  </div>

</div>

)}

    </DashboardLayout>

  );

};

export default AdminCommercial;