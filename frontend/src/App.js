import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Bookings from "./pages/Bookings";
import Bins from "./pages/Bins";
import WasteTypes from "./pages/WasteTypes";
import Promotions from "./pages/Promotions";
import Reports from "./pages/Reports";

import Home from "./pages/Home";
import BookingWebsite from "./pages/BookingWebsite";
import Commercial from "./pages/Commercial";
import Contact from "./pages/Contact";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC WEBSITE */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/booking"
          element={<BookingWebsite />}
        />

        <Route
          path="/commercial"
          element={<Commercial />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* ADMIN */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/bookings"
          element={<Bookings />}
        />

        <Route
          path="/bins"
          element={<Bins />}
        />

        <Route
          path="/waste-types"
          element={<WasteTypes />}
        />

        <Route
          path="/promotions"
          element={<Promotions />}
        />

        <Route
          path="/reports"
          element={<Reports />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;