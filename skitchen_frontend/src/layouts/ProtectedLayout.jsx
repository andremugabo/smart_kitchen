import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedLayout = () => {
  const user = useSelector((state) => state.user.user);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-200 text-sm">
        Loading session...
      </div>
    );
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default ProtectedLayout;
