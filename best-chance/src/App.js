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
import CombinedOrderMaterial from "./pages/Order/CombinedOrder/CombinedOrderMaterialPage";
import CombinedOrderFleet from "./pages/Order/CombinedOrder/CombinedOrderFleetPage";
import CombinedOrderConfirmation from "./pages/Order/CombinedOrder/CombinedOrderConfirmationPage";
import Material from "./pages/Order/Material/MaterialOrderPage";
import MaterialConfirmation from "./pages/Order/Material/MaterialOrderConfirmationPage"
import OperationalFee from "./pages/Order/OperationalFeePage"
import ProjectExpense from "./pages/Order/ProjectExpensePage"
import Fleet from "./pages/Order/FleetOrderPage";
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
          element={<ProtectedRoute element={<CombinedOrderMaterial />} />}
        />
        <Route
          path="/order-next/:projectID"
          element={<ProtectedRoute element={<CombinedOrderFleet />} />}
        />
        <Route
          path="/order-confirmation/:projectID"
          element={<ProtectedRoute element={<CombinedOrderConfirmation />} />}
        />
        <Route
          path="/material/:projectID"
          element={<ProtectedRoute element={<Material />} />}
        />
        <Route
          path="/material-confirmation/:projectID"
          element={<ProtectedRoute element={<MaterialConfirmation />} />}
        />
        <Route
          path="/fleet/:projectID"
          element={<ProtectedRoute element={<Fleet />} />}
        />
        <Route
          path="/operational-fee/:projectID"
          element={<ProtectedRoute element={<OperationalFee />} />}
        />
        <Route
          path="/project-expense/:projectID"
          element={<ProtectedRoute element={<ProjectExpense />} />}
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
