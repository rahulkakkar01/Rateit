import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginpage";
import SignupPage from "./pages/signuppages";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRatingsPage from "./pages/AdminRatingsPage";
import UserDashboard from "./pages/UserDashboard";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";

import AuthProvider from "./context/authcontext";
import { useAuth } from "./context/authcontext";

function PrivateRoute({ children, role }: { children: React.ReactElement, role?: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    // Redirect to correct dashboard if role doesn't match
    if (user.role === "admin") return <Navigate to="/admin-dashboard" />;
    if (user.role === "shopowner") return <Navigate to="/shopowner-dashboard" />;
    return <Navigate to="/dashboard" />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute role="user">
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute role="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/shopowner-dashboard"
            element={
              <PrivateRoute role="shopowner">
                <StoreOwnerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-ratings"
            element={
              <PrivateRoute role="admin">
                <AdminRatingsPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
