import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordOtp } from "../../services/userService";
import { AuthShell, Input, Button, Alert } from "../../components";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await requestPasswordOtp(email);
      setMessage(res?.message || "OTP sent to your email");
      localStorage.setItem("resetEmail", email);
      navigate("/otp");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to send OTP";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we will send you an OTP to reset your password."
    >
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="flex flex-col gap-2 mt-4">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send OTP"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs"
            onClick={() => navigate("/login")}
          >
            Back to login
          </Button>
        </div>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;