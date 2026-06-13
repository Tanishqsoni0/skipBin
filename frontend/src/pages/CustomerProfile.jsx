import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const CustomerProfile = () => {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");
  const [overrideStatus, setOverrideStatus] = useState("none");
  const [overrideSaving, setOverrideSaving] = useState(false);
  const [overrideMsg, setOverrideMsg] = useState("");

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      const [customerRes, historyRes, notesRes] = await Promise.all([
        api.get(`/customers/${id}`),
        api.get(`/customers/${id}/history`),
        api.get(`/customers/${id}/notes`),
      ]);
      setCustomer(customerRes.data);
      setHistory(historyRes.data);
      setNotes(notesRes.data);
      setOverrideStatus(customerRes.data.loyalty_override || "none");
    } catch (err) {
      console.log(err);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    await api.post(`/customers/${id}/notes`, { note: newNote });
    setNewNote("");
    loadCustomer();
  };

  const deleteNote = async (noteId) => {
    if (!window.confirm("Delete note?")) return;
    await api.delete(`/notes/${noteId}`);
    loadCustomer();
  };

  const startEdit = (note) => {
    setEditingNote(note.note_id);
    setEditText(note.note);
  };

  const saveEdit = async (noteId) => {
    await api.put(`/notes/${noteId}`, { note: editText });
    setEditingNote(null);
    loadCustomer();
  };

  // ── Loyalty override ───────────────────────────────────────────────────────
  const handleOverride = async (value) => {
    setOverrideSaving(true);
    setOverrideMsg("");
    try {
      await api.put(`/customers/${id}/loyalty-override`, { override: value });
      setOverrideStatus(value);
      setOverrideMsg(
        value === "approved"
          ? "✅ Override approved — next booking will be free."
          : value === "declined"
            ? "🚫 Override declined — free bin blocked for next booking."
            : "↩️ Override cleared — normal loyalty rules apply.",
      );
    } catch (err) {
      setOverrideMsg("❌ Failed to update override.");
    } finally {
      setOverrideSaving(false);
    }
  };

  if (!customer) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  const totalSpend = history.reduce(
    (sum, b) => sum + Number(b.total_amount || 0),
    0,
  );

  const realCount = history.length;
  const progress = realCount % 7;
  const binsLeft = progress === 0 && realCount > 0 ? 6 : 6 - progress;
  const qualifies = (realCount + 1) % 7 === 0;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Customer Profile</h1>
      </div>

      {/* ── Basic info ── */}
      <div className="stat-card">
        <h2>
          {customer.first_name} {customer.last_name}
        </h2>
        <br />
        <p>📞 {customer.mobile}</p>
        <p>✉ {customer.email}</p>
      </div>

      <br />

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "20px",
        }}
      >
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <h1>{history.length}</h1>
        </div>
        <div className="stat-card">
          <h3>Total Spend</h3>
          <h1>${totalSpend.toFixed(2)}</h1>
        </div>
        <div className="stat-card">
          <h3>Loyalty Progress</h3>
          <h1>{progress} / 6</h1>
          <div
            style={{
              width: "100%",
              height: 8,
              background: "#e2e8f0",
              borderRadius: 999,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <div
              style={{
                width: `${(progress / 6) * 100}%`,
                height: "100%",
                background: qualifies ? "#22c55e" : "#f59e0b",
                borderRadius: 999,
                transition: "width 0.3s",
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
            {qualifies
              ? "🎁 Qualifies for free bin!"
              : `${binsLeft} more bin${binsLeft !== 1 ? "s" : ""} until free hire`}
          </p>
        </div>
      </div>

      <br />

      {/* ── Loyalty Override ── */}
      <div className="stat-card">
        <h2>🎁 Loyalty Reward Override</h2>
        <br />
        <p style={{ color: "#64748b", marginBottom: 16, fontSize: 14 }}>
          Manually approve or decline the loyalty reward for this customer's
          next booking. Override takes priority over the automatic loyalty
          count.
        </p>

        {/* Current status badge */}
        <div style={{ marginBottom: 16 }}>
          <span
            style={{
              padding: "4px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              background:
                overrideStatus === "approved"
                  ? "rgba(34,197,94,0.15)"
                  : overrideStatus === "declined"
                    ? "rgba(220,38,38,0.15)"
                    : "rgba(100,116,139,0.15)",
              color:
                overrideStatus === "approved"
                  ? "#16a34a"
                  : overrideStatus === "declined"
                    ? "#dc2626"
                    : "#64748b",
            }}
          >
            {overrideStatus === "approved" &&
              "✅ Override: Approved — next booking FREE"}
            {overrideStatus === "declined" &&
              "🚫 Override: Declined — free bin blocked"}
            {overrideStatus === "none" &&
              "↩️ No override — normal loyalty rules apply"}
          </span>
        </div>

        {/* Override buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            className="edit-btn"
            style={{
              background: overrideStatus === "approved" ? "#16a34a" : undefined,
              opacity: overrideSaving ? 0.7 : 1,
            }}
            disabled={overrideSaving || overrideStatus === "approved"}
            onClick={() => handleOverride("approved")}
          >
            ✅ Approve Free Bin
          </button>

          <button
            className="delete-btn"
            style={{ opacity: overrideSaving ? 0.7 : 1 }}
            disabled={overrideSaving || overrideStatus === "declined"}
            onClick={() => handleOverride("declined")}
          >
            🚫 Decline Free Bin
          </button>

          <button
            className="edit-btn"
            style={{ opacity: overrideSaving ? 0.7 : 1 }}
            disabled={overrideSaving || overrideStatus === "none"}
            onClick={() => handleOverride("none")}
          >
            ↩️ Clear Override
          </button>
        </div>

        {overrideMsg && (
          <p style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
            {overrideMsg}
          </p>
        )}
      </div>

      <br />

      {/* ── Notes ── */}
      <div className="stat-card">
        <h2>Internal Notes</h2>
        <br />
        <textarea
          rows="4"
          cols="130"
          placeholder="Add note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <br />
        <br />
        <button className="edit-btn" onClick={addNote}>
          Add Note
        </button>
      </div>

      <br />

      {notes.map((note) => (
        <div key={note.note_id} className="stat-card">
          {editingNote === note.note_id ? (
            <>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <br />
              <br />
              <button
                className="edit-btn"
                onClick={() => saveEdit(note.note_id)}
              >
                Save
              </button>
              <button
                className="delete-btn"
                onClick={() => setEditingNote(null)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>{note.note}</p>
              <br />
              <small>{note.created_at}</small>
              <br />
              <br />
              <button className="edit-btn" onClick={() => startEdit(note)}>
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteNote(note.note_id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}

      {/* ── Booking history ── */}
      <div className="table-container">
        <h2>Booking History</h2>
        <br />
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
            {history.map((booking) => (
              <tr key={booking.booking_id}>
                <td>{booking.booking_id}</td>
                <td>{booking.size}</td>
                <td>{booking.delivery_address}</td>
                <td>{booking.delivery_date}</td>
                <td>{booking.collection_date}</td>
                <td>{booking.status}</td>
                <td>${booking.total_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
