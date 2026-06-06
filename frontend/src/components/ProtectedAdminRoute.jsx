// components/ProtectedAdminRoute.jsx
// Wrap any admin route with this to block unauthenticated access.
// If no valid admin token is found, redirects to /admin/login automatically.

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isAdminLoggedIn, fetchAdminMe } from "../services/adminAuthService";

export default function ProtectedAdminRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "ok" | "denied"

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      setStatus("denied");
      return;
    }

    // Verify token is still valid with the server
    fetchAdminMe().then((result) => {
      if (result.success) {
        setStatus("ok");
      } else {
        setStatus("denied");
      }
    });
  }, []);

  if (status === "checking") {
    return (
      <div className="admin-auth-checking">
        <span>Verifying access...</span>
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
