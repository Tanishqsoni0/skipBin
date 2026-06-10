import React,{useEffect,useState} from "react";
import {useParams} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const CustomerProfile=()=>{

  const {id}=useParams();

  const [customer,setCustomer]=useState(null);
  const [history,setHistory]=useState([]);
  const [notes,setNotes]=useState([]);
  const [newNote,setNewNote]=useState("");
  const [editingNote,setEditingNote] =useState(null);
  const [editText,setEditText] =useState("");
  useEffect(()=>{

    loadCustomer();

  },[]);
  const addNote=async()=>{

  if(!newNote.trim())
  return;

  await api.post(
    `/customers/${id}/notes`,
    {
      note:newNote
    }
  );

  setNewNote("");

  loadCustomer();

};
const deleteNote = async(id)=>{

  if(
    !window.confirm(
      "Delete note?"
    )
  ) return;

  await api.delete(
    `/notes/${id}`
  );

  loadCustomer();

};
const startEdit=(note)=>{

  setEditingNote(
    note.note_id
  );

  setEditText(
    note.note
  );

};
const saveEdit=async(id)=>{

  await api.put(
    `/notes/${id}`,
    {
      note:editText
    }
  );

  setEditingNote(null);

  loadCustomer();

};
  const loadCustomer=async()=>{

    try{

      const customerRes=
      await api.get(
        `/customers/${id}`
      );

      const historyRes=
      await api.get(
        `/customers/${id}/history`
      );

      const notesRes=
        await api.get(
        `/customers/${id}/notes`
        );

        setNotes(
        notesRes.data
        );

      setCustomer(
        customerRes.data
      );

      setHistory(
        historyRes.data
      );

    }
    catch(err){

      console.log(err);

    }

  };

  if(!customer){

    return(
      <DashboardLayout>
        Loading...
      </DashboardLayout>
    );

  }

  const totalSpend=
  history.reduce(
    (sum,b)=>
    sum+Number(
      b.total_amount||0
    ),
    0
  );

  return(

    <DashboardLayout>
      <div className="page-header">
      <h1>
        Customer Profile
      </h1>

      </div>

      <div className="stat-card">

        <h2>

          {customer.first_name}
          {" "}
          {customer.last_name}

        </h2>

        <br/>

        <p>
          📞 {customer.mobile}
        </p>

        <p>
          ✉ {customer.email}
        </p>

      </div>

      <br/>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:
          "repeat(3,1fr)",
          gap:"20px"
        }}
      >

        <div className="stat-card">

          <h3>
            Total Bookings
          </h3>

          <h1>
            {history.length}
          </h1>

        </div>

        <div className="stat-card">

          <h3>
            Total Spend
          </h3>

          <h1>
            $
            {totalSpend.toFixed(2)}
          </h1>

        </div>

        <div className="stat-card">

          <h3>
            Loyalty
          </h3>

          <h1>
            {
              customer.loyalty_count
            }
            /7
          </h1>

        </div>

      </div>

      <br/>

<div className="stat-card">

  <h2>
    Internal Notes
  </h2>

  <br/>

  <textarea
    rows="4"
    cols="130"
    placeholder="Add note..."
    value={newNote}
    onChange={(e)=>
      setNewNote(
        e.target.value
      )
    }
  />

  <br/>
  <br/>

  <button className="edit-btn"
    onClick={addNote}
  >
    Add Note
  </button>

</div>

<br/>

{
notes.map(note=>(

<div
  key={note.note_id}
  className="stat-card"
>

{
editingNote===note.note_id ?

<>

<textarea
  value={editText}
  onChange={(e)=>
    setEditText(
      e.target.value
    )
  }
/>

<br/>
<br/>

<button className="edit-btn"
  onClick={()=>
    saveEdit(
      note.note_id
    )
  }
>
  Save
</button>

<button className="delete-btn"
  onClick={()=>
    setEditingNote(
      null
    )
  }
>
  Cancel
</button>

</>

:

<>

<p>
  {note.note}
</p>

<br/>

<small>
  {note.created_at}
</small>

<br/>
<br/>

<button className="edit-btn"
  onClick={()=>
    startEdit(note)
  }
>
  Edit
</button>
<button className="delete-btn"
  onClick={()=>
    deleteNote(
      note.note_id
    )
  }
>
  Delete
</button>

</>

}

</div>

))
}
      <div className="table-container">

        <h2>
          Booking History
        </h2>

        <br/>

        <table>

          <thead>

            <tr>

              <th>ID</th>
              <th>Bin Size</th>
              <th>Delivery Address</th>
              <th>Delivery Date</th>
              <th>Collection Date</th>
              <th>Status</th>
              <th>Total</th>

            </tr>

          </thead>

          <tbody>

            {
              history.map(
                booking=>(

                <tr
                  key={
                    booking.booking_id
                  }
                >

                  <td>
                    {
                      booking.booking_id
                    }
                  </td>
                    <td>
                      {
                        booking.size
                      }
                    </td>
                    <td>
                      {
                        booking.delivery_address
                      }
                    </td>
                  <td>
                    {
                      booking.delivery_date
                    }
                  </td>

                  <td>
                    {
                      booking.collection_date
                    }
                  </td>

                  <td>
                    {
                      booking.status
                    }
                  </td>

                  <td>
                    $
                    {
                      booking.total_amount
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

export default CustomerProfile;