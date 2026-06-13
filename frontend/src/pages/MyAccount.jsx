import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAccessToken, fetchMe } from "../services/authService";
import api from "../services/api";
import "../MyAccount.css";

function initials(first = "", last = "") {
  return `${first[0] || ""}${last[0] || ""}`.toUpperCase();
}

function Field({ label, value, onChange, type = "text", fullWidth = false }) {
  return (
    <div className={`account-field${fullWidth ? " full-width" : ""}`}>
      <label className="account-label">{label}</label>
      <input
        className="account-input"
        type={type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  );
}

export default function MyAccount() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({});
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [savingPw, setSavingPw] = useState(false);

  // ── fetch profile on mount using authService ──
  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/loginpage");
      return;
    }

    fetchMe()
      .then((result) => {
        if (!result.success) {
          navigate("/loginpage");
          return;
        }
        setCustomer(result.customer);
        setLoyalty(result.loyalty);
        setProfile({
          first_name: result.customer.first_name || "",
          last_name: result.customer.last_name || "",
          email: result.customer.email || "",
          mobile: result.customer.mobile || "",
          address: result.customer.address || "",
        });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // ── save profile ──
  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const token = getAccessToken();
      const { data } = await api.put("/api/auth/update-profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomer(data.customer);
      setProfileMsg({ type: "success", text: "Profile saved." });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.error || "Could not save profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── change password ──
  const changePassword = async () => {
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    try {
      const token = getAccessToken();
      await api.put(
        "/api/auth/change-password",
        { current_password: pw.current, new_password: pw.next },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPwMsg({ type: "success", text: "Password changed." });
      setPw({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwMsg({
        type: "error",
        text: err.response?.data?.error || "Could not change password.",
      });
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return <div className="account-loading">Loading your account…</div>;
  }

  const loyaltyPct = loyalty ? Math.round((loyalty.progress / 7) * 100) : 0;

  return (
    <div className="account-page">
      {/* nav */}
      <nav className="account-nav">
        <Link to="/" className="account-nav-brand">
          Jerry's Bins
        </Link>
        <Link to="/" className="account-nav-back">
          ← Back to site
        </Link>
      </nav>

      {/* hero */}
      <div className="account-hero">
        <div className="account-avatar">
          {initials(customer?.first_name, customer?.last_name)}
        </div>
        <div>
          <div className="account-hero-name">
            {customer?.first_name} {customer?.last_name}
          </div>
          <div className="account-hero-email">{customer?.email}</div>
        </div>
      </div>

      <div className="account-body">
        {/* loyalty */}
        <div className="account-card">
          <div className="account-section-title">🎁 Loyalty Reward</div>
          <div className="loyalty-row">
            <span className="loyalty-label">Total bins hired</span>
            <span className="loyalty-value">{loyalty?.total_hires ?? 0}</span>
          </div>
          <div className="loyalty-track">
            <div
              className="loyalty-fill"
              style={{ width: `${((loyalty.progress % 7) / 6) * 100}%` }}
            />
          </div>
          <div className="loyalty-row">
            <span className="loyalty-note">
              {loyalty?.progress ?? 0} / 6 toward your next free bin
            </span>
            <span className="loyalty-value amber">
              {loyalty?.bins_until_free ?? 6} more to go
            </span>
          </div>
          {loyalty?.bins_until_free === 1 && (
            <div className="loyalty-free-msg">
              🎉 Your next booking is FREE!
            </div>
          )}
        </div>

        {/* bookings link */}
        <Link to="/my-bookings" className="account-bookings-link">
          <div className="bookings-link-left">
            <div className="bookings-link-icon">🗓</div>
            <div>
              <div className="bookings-link-title">My Bookings</div>
              <div className="bookings-link-sub">
                View and track all your bin hire orders
              </div>
            </div>
          </div>
          <span className="bookings-link-arrow">›</span>
        </Link>

        {/* profile form */}
        <div className="account-card">
          <div className="account-section-title">Personal Details</div>
          <div className="account-form-grid">
            <Field
              label="First Name"
              value={profile.first_name}
              onChange={(v) => setProfile({ ...profile, first_name: v })}
            />
            <Field
              label="Last Name"
              value={profile.last_name}
              onChange={(v) => setProfile({ ...profile, last_name: v })}
            />
            <Field
              label="Email"
              type="email"
              value={profile.email}
              onChange={(v) => setProfile({ ...profile, email: v })}
            />
            <Field
              label="Mobile"
              value={profile.mobile}
              onChange={(v) => setProfile({ ...profile, mobile: v })}
            />
            <Field
              label="Address"
              value={profile.address}
              onChange={(v) => setProfile({ ...profile, address: v })}
              fullWidth
            />
          </div>
          {profileMsg && (
            <div className={`account-toast ${profileMsg.type}`}>
              {profileMsg.text}
            </div>
          )}
          <div className="account-btn-row">
            <button
              className="account-btn-ghost"
              onClick={() => setProfileMsg(null)}
            >
              Cancel
            </button>
            <button
              className="account-btn-primary"
              onClick={saveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* password form */}
        <div className="account-card">
          <div className="account-section-title">Change Password</div>
          <div className="account-form-grid">
            <Field
              label="Current Password"
              type="password"
              value={pw.current}
              onChange={(v) => setPw({ ...pw, current: v })}
              fullWidth
            />
            <Field
              label="New Password"
              type="password"
              value={pw.next}
              onChange={(v) => setPw({ ...pw, next: v })}
            />
            <Field
              label="Confirm New Password"
              type="password"
              value={pw.confirm}
              onChange={(v) => setPw({ ...pw, confirm: v })}
            />
          </div>
          {pwMsg && (
            <div className={`account-toast ${pwMsg.type}`}>{pwMsg.text}</div>
          )}
          <div className="account-btn-row">
            <button
              className="account-btn-ghost"
              onClick={() => {
                setPw({ current: "", next: "", confirm: "" });
                setPwMsg(null);
              }}
            >
              Clear
            </button>
            <button
              className="account-btn-primary"
              onClick={changePassword}
              disabled={savingPw}
            >
              {savingPw ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
