import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchMe, logout, getStoredCustomer, isLoggedIn } from "../services/authService";

export default function Navbar({ onNavigate, currentPage }) {
  const [customer, setCustomer] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // On mount — if a token exists fetch fresh profile from server
  useEffect(() => {
    if (isLoggedIn()) {
      // Show cached customer immediately while the request runs
      setCustomer(getStoredCustomer());

      fetchMe().then((result) => {
        if (result.success) {
          setCustomer(result.customer);
          setLoyalty(result.loyalty);
        } else {
          // Token likely expired — clear and show logged-out state
          logout();
          setCustomer(null);
          setLoyalty(null);
        }
      });
    }
  }, []);

  async function handleLogout() {
    await logout();
    setCustomer(null);
    setLoyalty(null);
    navigate("/");
  }

  const navLinks = [
    { label: "Home", page: "home" },
    { label: "Book Bin", page: "booking" },
    { label: "Commercial", page: "commercial" },
    { label: "Contact", page: "contact" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <button className="navbar-logo" onClick={() => navigate("/")}>
          Jerry's Bins
        </button>

        {/* Desktop links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <button
              key={link.page}
              className={`navbar-link ${currentPage === link.page ? "active" : ""}`}
              onClick={() => navigate(`/${link.page}`)}
            >
              {link.label}
            </button>
          ))}

          {customer ? (
            /* ── LOGGED IN ── */
            <div className="navbar-user">
              <button
                className="navbar-user-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
              >
                <span className="navbar-user-avatar">
                  {customer.first_name?.[0]?.toUpperCase() ?? "U"}
                </span>
                <span className="navbar-user-name">{customer.first_name}</span>
                <span className="navbar-user-caret">{menuOpen ? "▲" : "▼"}</span>
              </button>

              {/* Loyalty pill */}
              {loyalty && (
                <div className="loyalty-pill" title={`${loyalty.bins_until_free} more bin${loyalty.bins_until_free !== 1 ? "s" : ""} until your free hire!`}>
                  <span className="loyalty-pill-icon">🎁</span>
                  <div className="loyalty-pill-bar-wrap">
                    <div
                      className="loyalty-pill-bar"
                      style={{ width: `${(loyalty.progress / 7) * 100}%` }}
                    />
                  </div>
                  <span className="loyalty-pill-label">
                    {loyalty.progress}/7
                  </span>
                </div>
              )}

              {/* Dropdown */}
              {menuOpen && (
                <div className="navbar-dropdown">
                  <button
                    className="navbar-dropdown-item"
                    onClick={() => { setMenuOpen(false); navigate("/my-account"); }}
                  >
                    My Account
                  </button>
                  <button
                    className="navbar-dropdown-item"
                    onClick={() => { setMenuOpen(false); navigate("/my-bookings"); }}
                  >
                    My Bookings
                  </button>
                  <div className="navbar-dropdown-divider" />
                  <button
                    className="navbar-dropdown-item danger"
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── LOGGED OUT ── */
            <div className="navbar-auth-links">
              <button
                className="navbar-link"
                onClick={() => navigate("/loginpage")}
              >
                Login
              </button>
              <span className="navbar-auth-sep">or</span>
              <button
                className="navbar-link"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}