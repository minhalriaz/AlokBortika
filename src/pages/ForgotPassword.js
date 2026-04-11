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
    if (resendTimer > 0) return;

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

  const stepInfo = [
    { title: "Verify Email", subtitle: "Enter your email to receive a reset code" },
    { title: "Enter OTP", subtitle: "Check your email for the verification code" },
    { title: "New Password", subtitle: "Create a new secure password" },
  ];

  return (
    <div className="page">
      <div className="bgGlow bgGlow1" />
      <div className="bgGlow bgGlow2" />

      <div className="authPage">
        <div className="authContainer">
          <div className="authLeft">
            <div className="authLeftContent">
              <Link to="/" className="authLogo">
                AlokBortika
              </Link>
              <h1>Reset your password</h1>
              <p>Follow the steps to recover access to your account.</p>
              <div className="authFeatures">
                <div className="authFeature">
                  <span className="authFeatureIcon">1</span>
                  <span>Enter your registered email</span>
                </div>
                <div className="authFeature">
                  <span className="authFeatureIcon">2</span>
                  <span>Verify with OTP code</span>
                </div>
                <div className="authFeature">
                  <span className="authFeatureIcon">3</span>
                  <span>Create new password</span>
                </div>
              </div>
            </div>
          </div>

          <div className="authRight">
            <div className="authFormContainer">
              <div className="authFormHeader">
                <h2>{stepInfo[step - 1].title}</h2>
                <p>{stepInfo[step - 1].subtitle}</p>
              </div>

              <div className="authStepIndicator">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`authStepDot ${s === step ? "active" : ""} ${s < step ? "completed" : ""}`}
                  />
                ))}
              </div>

              {error && <div className="authError">{error}</div>}
              {success && <div className="authSuccess">{success}</div>}

              {step === 1 && (
                <form className="authFormFields" onSubmit={handleSendOtp}>
                  <div className="formGroup">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      className="authInput"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button className="authSubmitBtn" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Code"}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form className="authFormFields" onSubmit={handleVerifyOtp}>
                  <div className="formGroup">
                    <label htmlFor="otp">6-Digit OTP</label>
                    <input
                      id="otp"
                      className="authInput otpInput"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(event) =>
                        setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      maxLength={6}
                      required
                      disabled={loading}
                    />
                    <small className="authHint">Enter the code sent to your email</small>
                  </div>

                  <button className="authSubmitBtn" type="submit" disabled={loading}>
                    Verify OTP
                  </button>

                  <button
                    type="button"
                    className="authResendBtn"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP Code"}
                  </button>
                </form>
              )}

              {step === 3 && (
                <form className="authFormFields" onSubmit={handleResetPassword}>
                  <div className="formGroup">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      className="authInput"
                      type="password"
                      placeholder="Create new password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>

                  <div className="formGroup">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      className="authInput"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                    <small className="authHint">Must be at least 6 characters</small>
                  </div>

                  <button className="authSubmitBtn" type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}

              {step > 1 && (
                <button
                  type="button"
                  className="authBackBtn"
                  onClick={() => {
                    setStep((previous) => previous - 1);
                    setError("");
                    setSuccess("");
                  }}
                >
                  ← Back
                </button>
              )}

              <p className="authSignUprompt">
                Remember your password?{" "}
                <Link to="/login" className="authSignUpLink">
                  Sign in
                </Link>
              </p>

              <Link to="/" className="authBackLink">
                <span>←</span> Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}