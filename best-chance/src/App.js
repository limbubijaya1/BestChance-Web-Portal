import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Vendor from "./pages/Vendor";
import Supplier from "./pages/Suppliers";
import Order from "./pages/Order/CombinedOrderPage";
import Material from "./pages/Order/MaterialOrderPage";
import Cookies from "js-cookie";

const clearAuthData = () => {
  // Clear all cookies
  Object.keys(Cookies.get()).forEach((cookieName) => {
    Cookies.remove(cookieName);
  });
  // Clear localStorage
  localStorage.clear();
};

const ProtectedRoute = ({ element }) => {
  const token = Cookies.get("access_token"); // Check for token in cookies
  if (!token) {
    clearAuthData(); // Clear everything if no token exists
    return <Navigate to="/login" />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute element={<Index />} />} />
        <Route
          path="/vendor"
          element={<ProtectedRoute element={<Vendor />} />}
        />
        <Route
          path="/supplier"
          element={<ProtectedRoute element={<Supplier />} />}
        />
        <Route
          path="/order/:projectID"
          element={<ProtectedRoute element={<Order />} />}
        />
        <Route
          path="/material/:projectID"
          element={<ProtectedRoute element={<Material />} />}
        />
        <Route
          path="/fleet/:projectID"
          element={<ProtectedRoute element={<Order />} />}
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
