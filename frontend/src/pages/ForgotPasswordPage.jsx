import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => prev + 1);

  return (
    <div className="auth-page">
      <nav className="auth-nav">
        <span className="auth-logo">Jerry's Bins</span>
        <a className="auth-nav-link" onClick={() => navigate("/home")}>
          ← Back to Home
        </a>
      </nav>

      <div className="auth-body">
        <div className="auth-card">

          <div className="progress-dots">
            <span className={`dot ${step >= 1 ? "active" : ""}`} />
            <span className={`dot ${step >= 2 ? "active" : ""}`} />
            <span className={`dot ${step >= 3 ? "active" : ""}`} />
          </div>

          {step === 1 && (
            <div className="step-section">
              <div className="step-icon step-icon-amber">🔒</div>
              <h1 className="auth-title centered">Forgot password?</h1>
              <p className="auth-subtitle centered">
                Enter your email and we'll send a reset code
              </p>
              <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label className="form-label" htmlFor="forgot-email">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <button type="button" className="btn-primary" onClick={nextStep}>
                  Send Reset Code
                </button>
              </form>
              <p className="auth-footer-text">
                Remember it?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => navigate("/loginpage")}
                >
                  Back to login
                </button>
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="step-section">
              <div className="step-icon step-icon-amber">✉️</div>
              <h1 className="auth-title centered">Check your email</h1>
              <p className="auth-subtitle centered">
                We sent a 6-digit code to your email address
              </p>
              <div className="otp-row">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    className="otp-input"
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    aria-label={`Digit ${i + 1}`}
                    onInput={(e) => {
                      if (e.target.value && e.target.nextSibling) {
                        e.target.nextSibling.focus();
                      }
                    }}
                  />
                ))}
              </div>
              <button type="button" className="btn-primary" onClick={nextStep}>
                Verify Code
              </button>
              <p className="auth-footer-text">
                Didn't receive it?{" "}
                <button type="button" className="auth-link">
                  Resend code
                </button>
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="step-section">
              <div className="step-icon step-icon-amber">🔑</div>
              <h1 className="auth-title centered">New password</h1>
              <p className="auth-subtitle centered">
                Choose a strong new password
              </p>
              <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-pw1">
                    New password
                  </label>
                  <div className="input-icon-wrap">
                    <input
                      id="reset-pw1"
                      className="form-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
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
                  <label className="form-label" htmlFor="reset-pw2">
                    Confirm new password
                  </label>
                  <div className="input-icon-wrap">
                    <input
                      id="reset-pw2"
                      className="form-input"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
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
                <button type="button" className="btn-primary" onClick={nextStep}>
                  Reset Password
                </button>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="step-section">
              <div className="step-icon step-icon-green">✓</div>
              <h1 className="auth-title centered">Password reset!</h1>
              <p className="auth-subtitle centered">
                Your password has been updated successfully
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate("/loginpage")}
              >
                Back to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
