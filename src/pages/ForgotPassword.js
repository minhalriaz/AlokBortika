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
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await sendResetOtp(email);
      
      if (result.success) {
        setSuccess(`OTP sent to ${email}`);
        setStep(2);
        startResendTimer();
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError("");
    setLoading(true);

    try {
      const result = await sendResetOtp(email);
      
      if (result.success) {
        setSuccess(`New OTP sent to ${email}`);
        startResendTimer();
      } else {
        setError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Move to next step without verifying OTP separately
      // The OTP will be verified during password reset
      setStep(3);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email, otp, newPassword);
      
      if (result.success) {
        setSuccess('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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
            {step === 1 && "Enter your email to receive a verification OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create a new password"}
          </p>

          <div className="card" style={{ maxWidth: 520 }}>
            {error && (
              <div style={{ 
                color: '#ff6b6b', 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: 'rgba(255,107,107,0.1)', 
                borderRadius: '4px',
                border: '1px solid rgba(255,107,107,0.3)',
                fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ 
                color: '#51cf66', 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: 'rgba(81,207,102,0.1)', 
                borderRadius: '4px',
                border: '1px solid rgba(81,207,102,0.3)',
                fontSize: '0.9rem'
              }}>
                {success}
              </div>
            )}

            {/* Step 1: Email Form */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Email Address</div>
                  <input 
                    className="input" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                  />
                </label>

                <button 
                  className="primary" 
                  type="submit"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Sending...' : 'Send Reset OTP'}
                </button>
              </form>
            )}

            {/* Step 2: OTP Form */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Enter OTP</div>
                  <input 
                    className="input" 
                    type="text" 
                    placeholder="6-digit OTP" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    disabled={loading}
                    maxLength={6}
                    style={{ opacity: loading ? 0.7 : 1 }}
                  />
                  <small style={{ color: 'rgba(233,236,242,0.5)', fontSize: '0.8rem', marginTop: 4 }}>
                    Enter the 6-digit code sent to your email
                  </small>
                </label>

                <button 
                  className="primary" 
                  type="submit"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: resendTimer > 0 ? 'rgba(233,236,242,0.3)' : '#6c5ce7',
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      textDecoration: 'underline'
                    }}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password Form */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>New Password</div>
                  <input 
                    className="input" 
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    style={{ opacity: loading ? 0.7 : 1 }}
                  />
                </label>

                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Confirm Password</div>
                  <input 
                    className="input" 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    style={{ opacity: loading ? 0.7 : 1 }}
                  />
                </label>

                <small style={{ color: 'rgba(233,236,242,0.5)', fontSize: '0.8rem', marginTop: -4 }}>
                  Password must be at least 6 characters long
                </small>

                <button 
                  className="primary" 
                  type="submit"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {/* Navigation Links */}
            <div style={{ 
              marginTop: '1.5rem', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(233,236,242,0.1)',
              paddingTop: '1.5rem'
            }}>
              {step > 1 ? (
                <button
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                    setSuccess("");
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6c5ce7',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  ← Back
                </button>
              ) : (
                <Link to="/login" style={{ color: '#6c5ce7' }}>← Back to Login</Link>
              )}
              
              <Link to="/signup" style={{ color: '#6c5ce7' }}>Create account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}