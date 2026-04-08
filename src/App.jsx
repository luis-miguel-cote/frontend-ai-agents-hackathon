import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import { Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigir '/' a /login si no hay usuario, o a /dashboard si hay */}
        <Route
          path="/"
          element={
            localStorage.getItem("user") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
