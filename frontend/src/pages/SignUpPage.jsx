import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../services/authService";

export default function SignUpPage({ onNavigate, onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountType, setAccountType] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    first_name: "",
    last_name: "",
    business_name: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
  });

  function handleChange(e) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (fields.password !== fields.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (fields.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const result = await register({
      first_name: fields.first_name,
      last_name: fields.last_name,
      email: fields.email,
      mobile: fields.mobile,
      password: fields.password,
      account_type: accountType,
      business_name: accountType === "business" ? fields.business_name : undefined,
    });
    setLoading(false);

    if (result.success) {
      onLoginSuccess?.(result.customer);
      navigate("/home");
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="auth-page">
      <nav className="auth-nav">
        <span className="auth-logo">Jerry's Bins</span>
        <button className="auth-nav-link" onClick={() => navigate("/home")}>
          ← Back to Home
        </button>
      </nav>

      <div className="auth-body">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join Jerry's Bins and start earning rewards</p>
          </div>

          <div className="loyalty-badge">
            <span className="loyalty-badge-icon">🏆</span>
            <span className="loyalty-badge-text">
              Hire 6 bins, get your 7th bin free for one week!
            </span>
          </div>

          <div className="tab-row">
            <button
              type="button"
              className={`tab-btn ${accountType === "customer" ? "active" : ""}`}
              onClick={() => setAccountType("customer")}
            >
              Customer
            </button>
            <button
              type="button"
              className={`tab-btn ${accountType === "business" ? "active" : ""}`}
              onClick={() => setAccountType("business")}
            >
              Business
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="name-row">
              <div className="form-group">
                <label className="form-label" htmlFor="first-name">First name</label>
                <input
                  id="first-name"
                  name="first_name"
                  className="form-input"
                  type="text"
                  placeholder="John"
                  autoComplete="given-name"
                  value={fields.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="last-name">Last name</label>
                <input
                  id="last-name"
                  name="last_name"
                  className="form-input"
                  type="text"
                  placeholder="Smith"
                  autoComplete="family-name"
                  value={fields.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {accountType === "business" && (
              <div className="form-group">
                <label className="form-label" htmlFor="business-name">Business name</label>
                <input
                  id="business-name"
                  name="business_name"
                  className="form-input"
                  type="text"
                  placeholder="Acme Pty Ltd"
                  autoComplete="organization"
                  value={fields.business_name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                name="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={fields.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-mobile">Mobile number</label>
              <input
                id="signup-mobile"
                name="mobile"
                className="form-input"
                type="tel"
                placeholder="+61 4XX XXX XXX"
                autoComplete="tel"
                value={fields.mobile}
                onChange={handleChange}
                required
              />
              <span className="form-hint">Used to track your loyalty rewards</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="input-icon-wrap">
                <input
                  id="signup-password"
                  name="password"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  value={fields.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
              <div className="input-icon-wrap">
                <input
                  id="signup-confirm"
                  name="confirm_password"
                  className="form-input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={fields.confirm_password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{" "}
            <button type="button" className="auth-link" onClick={() => navigate("/loginpage")}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}