import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../api";

const AdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await api.get("/auth/me");

        setIsAdmin(data.user?.role === "admin");
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return null;
  }

  return isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default AdminRoute;