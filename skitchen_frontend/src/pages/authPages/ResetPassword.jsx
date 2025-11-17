import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPasswordWithOtp } from "../../services/userService";
import { AuthShell, Input, Button, Alert } from "../../components";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    const otp = localStorage.getItem("resetOtp");
    if (!email || !otp) {
      setError("Missing email or OTP. Please restart the reset process.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp({ email, otp, newPassword: password });
      setMessage("Password reset successfully. You can now log in.");
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to reset password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your new password to complete the reset."
    >
      <Alert variant="error">{error}</Alert>
      <Alert variant="success">{message}</Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading} className="w-full mt-4">
          {loading ? "Updating..." : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;