import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import AdminLoginPage from "./pages/AdminLoginPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Protected route guard
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// Admin dashboard pages
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Customers from "./pages/Customers";
import Bookings from "./pages/Bookings";
import Bins from "./pages/Bins";
import WasteTypes from "./pages/WasteTypes";
import HirePricing from "./pages/HirePricing";
import DistanceCharges from "./pages/DistanceCharges";
import AdminCommercial from "./pages/AdminCommercial";
import Promotions from "./pages/Promotions";
import Reports from "./pages/Reports";

// Public website pages
import Home from "./pages/Home";
import BookingWebsite from "./pages/BookingWebsite";
import Commercial from "./pages/Commercial";
import CommercialQuotes from "./pages/CommercialQuotes";
import Contact from "./pages/Contact";
import MyBookings from "./pages/MyBookings";
import CustomerProfile from "./pages/CustomerProfile";
import MyAccount from "./pages/MyAccount";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public website ── */}
        <Route path="/"                element={<Home />} />
        <Route path="/home"            element={<Home />} />
        <Route path="/booking"         element={<BookingWebsite />} />
        <Route path="/commercial"      element={<Commercial />} />
        <Route path="/commercial-quotes" element={<CommercialQuotes />} />
        <Route path="/contact"         element={<Contact />} />
        <Route path="/loginpage"       element={<LoginPage />} />
        <Route path="/signup"          element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/my-bookings"     element={<MyBookings />} />
        <Route path="/my-account"      element={<MyAccount />} />
        <Route path="/customers/:id" element={<ProtectedAdminRoute><CustomerProfile /></ProtectedAdminRoute>} />
        {/* ── Admin login (public) ── */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ── Protected admin dashboard routes ── */}
        {/* Every route below requires a valid admin token.         */}
        {/* If not logged in, user is redirected to /admin/login.  */}

        <Route path="/dashboard" element={
          <ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedAdminRoute><Calendar /></ProtectedAdminRoute>
        } />
        <Route path="/customers" element={
          <ProtectedAdminRoute><Customers /></ProtectedAdminRoute>
        } />

        <Route path="/bookings" element={
          <ProtectedAdminRoute><Bookings /></ProtectedAdminRoute>
        } />

        <Route path="/bins" element={
          <ProtectedAdminRoute><Bins /></ProtectedAdminRoute>
        } />

        <Route path="/waste-types" element={
          <ProtectedAdminRoute><WasteTypes /></ProtectedAdminRoute>
        } />

        <Route path="/hire-pricing" element={
          <ProtectedAdminRoute><HirePricing /></ProtectedAdminRoute>
        } />

        <Route path="/promotions" element={
          <ProtectedAdminRoute><Promotions /></ProtectedAdminRoute>
        } />

        <Route path="/distance-charges" element={
          <ProtectedAdminRoute><DistanceCharges /></ProtectedAdminRoute>
        } />

        <Route path="/admin/commercial" element={
          <ProtectedAdminRoute><AdminCommercial /></ProtectedAdminRoute>
        } />

        <Route path="/reports" element={
          <ProtectedAdminRoute><Reports /></ProtectedAdminRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;