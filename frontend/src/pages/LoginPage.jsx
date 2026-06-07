import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess?.(result.customer);
      // Redirect back to the page they were trying to visit (e.g. /booking)
      const redirectTo = sessionStorage.getItem("redirect_after_login") || "/";
      sessionStorage.removeItem("redirect_after_login");
      navigate(redirectTo, { replace: true });
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
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your Jerry's Bins account</p>
          </div>

          <div className="loyalty-badge">
            <span className="loyalty-badge-icon">🎁</span>
            <span className="loyalty-badge-text">
              Every 7th bin hire is free — sign in to track your rewards
            </span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-icon-wrap">
                <input
                  id="login-password"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="forgot-link-wrap">
              <button
                type="button"
                className="forgot-link"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer-text">
            Don't have an account?{" "}
            <button type="button" className="auth-link" onClick={() => navigate("/signup")}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}