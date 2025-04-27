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
import Cookies from "js-cookie";

const ProtectedRoute = ({ element }) => {
  const token = Cookies.get("access_token"); // Check for token in cookies
  return token ? element : <Navigate to="/login" />; // Redirect to login if no token
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
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
