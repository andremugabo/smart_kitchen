import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthShell, Input, Button, Alert } from "../../components";

const OtpPage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    setError("");
    localStorage.setItem("resetOtp", otp.trim());
    navigate("/reset-password");
  };

  return (
    <AuthShell
      title="Enter OTP"
      subtitle="We sent a one-time code to your email. Enter it below to continue."
    >
      <Alert variant="error">{error}</Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="OTP"
          type="text"
          className="tracking-widest text-center"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <Button type="submit" className="w-full mt-4">
          Continue
        </Button>
      </form>
    </AuthShell>
  );
};

export default OtpPage;
