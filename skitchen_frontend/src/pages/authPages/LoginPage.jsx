import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../services/userService";
import { setUser } from "../../store/userSlice";
import { AuthShell, Input, Button, Alert } from "../../components";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoutInfo, setLogoutInfo] = useState("");

  useEffect(() => {
    const reason = localStorage.getItem("logoutReason");
    if (reason === "inactive") {
      setLogoutInfo("You have been logged out due to inactivity.");
    } else if (reason === "expired") {
      setLogoutInfo("Your session has expired. Please sign in again.");
    }
    if (reason) {
      localStorage.removeItem("logoutReason");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLogoutInfo("");
    setLoading(true);
    try {
      const data = await login({ emailOrUsername: identifier, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.user) {
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("user", JSON.stringify(data.user));
        dispatch(setUser(data.user));

        const role = (data.user.role || "").toLowerCase();
        if (role === "admin") {
          navigate("/app/admin");
        } else if (role === "manager") {
          navigate("/app/manager");
        } else if (role === "chef") {
          navigate("/app/chef");
        } else if (role === "waiter") {
          navigate("/app/waiter");
        } else {
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } catch (err) {
      const message = err?.response?.data?.error || "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your Smart Kitchen operations."
    >
      {logoutInfo && (
        <Alert variant="success" className="mb-2">
          {logoutInfo}
        </Alert>
      )}
      <Alert variant="error">{error}</Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email or Username"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-sm mt-1">
          <Button
            type="button"
            variant="ghost"
            className="px-0"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Button>
        </div>

        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;