import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../App.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { sendResetOtp, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await sendResetOtp(email);
      if (result.success) {
        setSuccess(`OTP sent to ${email}`);
        setStep(2);
        startResendTimer();
      } else {
        setError(result.message || "Failed to send OTP. Please try again.");
      }
    } catch (_error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await sendResetOtp(email);
      if (result.success) {
        setSuccess(`New OTP sent to ${email}`);
        startResendTimer();
      } else {
        setError(result.message || "Failed to send OTP. Please try again.");
      }
    } catch (_error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email, otp, newPassword);
      if (result.success) {
        setSuccess("Password reset successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 1800);
      } else {
        setError(result.message || "Failed to reset password. Please try again.");
      }
    } catch (_error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="hero">
        <div className="heroInner">
          <div className="badge">Reset Password</div>
          <h1 className="title">Forgot Password?</h1>
          <p className="subtitle">
            {step === 1 ? "Enter your email to receive an OTP" : null}
            {step === 2 ? "Enter the OTP sent to your email" : null}
            {step === 3 ? "Set your new password" : null}
          </p>

          <div className="card" style={{ maxWidth: 560 }}>
            {error ? <p className="messageError">{error}</p> : null}
            {success ? <p className="messageSuccess">{success}</p> : null}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Email Address</div>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={loading}
                  />
                </label>

                <button className="primary" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset OTP"}
                </button>
              </form>
            ) : null}

            {step === 2 ? (
              <form onSubmit={handleVerifyOtp} style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Enter OTP</div>
                  <input
                    className="input"
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                  <small style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 4 }}>
                    Enter the 6-digit code from your email
                  </small>
                </label>

                <button className="primary" type="submit" disabled={loading}>
                  Continue
                </button>

                <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className="ghostBtn"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            ) : null}

            {step === 3 ? (
              <form onSubmit={handleResetPassword} style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>New Password</div>
                  <input
                    className="input"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </label>

                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Confirm Password</div>
                  <input
                    className="input"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </label>

                <small style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: -4 }}>
                  Password must be at least 6 characters long
                </small>

                <button className="primary" type="submit" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            ) : null}

            <div className="authLinksRow">
              {step > 1 ? (
                <button
                  type="button"
                  className="ghostBtn"
                  onClick={() => {
                    setStep((previous) => previous - 1);
                    setError("");
                    setSuccess("");
                  }}
                >
                  {"<- Back"}
                </button>
              ) : (
                <Link to="/login" className="inlineLink">
                  {"<- Back to Login"}
                </Link>
              )}

              <Link to="/signup" className="inlineLink">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
