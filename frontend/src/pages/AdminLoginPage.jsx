import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/adminAuthService";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await adminLogin(username, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-left">
        <div className="admin-login-brand">
          <span className="admin-brand-logo">Jerry's Bins</span>
          <p className="admin-brand-tagline">Premium Skip Bin Hire</p>
        </div>
        <div className="admin-brand-stats">
          <div className="admin-stat">
            <span className="admin-stat-value">5000+</span>
            <span className="admin-stat-label">Bins Delivered</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-value">2000+</span>
            <span className="admin-stat-label">Happy Customers</span>
          </div>
        </div>
      </div>

      <div className="admin-login-right">
        <div className="admin-login-card">

          <div className="admin-login-icon">🛡️</div>
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">
            Sign in to access the Jerry's Bins dashboard
          </p>

          {error && (
            <div className="admin-login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-username">
                Username
              </label>
              <input
                id="admin-username"
                className="admin-form-input"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="admin-password">
                Password
              </label>
              <div className="admin-input-icon-wrap">
                <input
                  id="admin-password"
                  className="admin-form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="admin-input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn-primary"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In to Dashboard"}
            </button>
          </form>

          <p className="admin-login-footer">
            Not an admin?{" "}
            <a className="admin-login-link" href="/">
              Back to website
            </a>
          </p>

          <div className="admin-login-note">
            🔒 This area is restricted to authorised staff only.
            <br />
            Unauthorised access attempts are logged.
          </div>

        </div>
      </div>
    </div>
  );
}