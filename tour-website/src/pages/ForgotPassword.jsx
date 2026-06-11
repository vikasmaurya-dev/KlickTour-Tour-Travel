import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import OtpVerify from '../components/OtpVerify';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep('otp');
      toast.success('Reset code sent to your email.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP (moves to password reset step)
  const handleVerifyOtp = async (enteredOtp) => {
    setOtp(enteredOtp);
    setStep('reset');
    setError('');
  };

  // Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setSuccess('Password reset successfully!');
      toast.success('Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      const result = await authService.resendOtp(email, 'reset');
      toast.success(result.message || 'Reset code resent successfully.');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Step 1: Enter email */}
        {step === 'email' && (
          <>
            <div className="auth-header">
              <img src="/klicktour-logo-dark.png" alt="KlickTour" className="auth-logo-img" />
              <h2>Forgot Password</h2>
              <p>Enter your email to receive a reset code</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSendOtp}>
              <div className="auth-field">
                <FaEnvelope className="auth-field-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>

            <p className="auth-switch">
              Remember your password? <Link to="/login">Sign In</Link>
            </p>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'otp' && (
          <OtpVerify
            email={email}
            purpose="reset"
            onVerify={handleVerifyOtp}
            onResend={handleResend}
            loading={loading}
            error={error}
          />
        )}

        {/* Step 3: Set new password */}
        {step === 'reset' && (
          <>
            <div className="auth-header">
              <img src="/klicktour-logo-dark.png" alt="KlickTour" className="auth-logo-img" />
              <h2>Set New Password</h2>
              <p>Choose a strong new password</p>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="auth-field">
                <FaLock className="auth-field-icon" />
                <input
                  type="password"
                  placeholder="New password (min. 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <FaLock className="auth-field-icon" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
