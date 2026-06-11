import React, { useCallback, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import OtpVerify from '../components/OtpVerify';
import './Auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form');
  const { initiateRegister, verifyRegister, signInWithGoogle, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => location.state?.from?.pathname || '/', [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      const message = 'Passwords do not match.';
      setError(message);
      toast.error(message);
      return;
    }

    if (password.length < 6) {
      const message = 'Password must be at least 6 characters.';
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      const result = await initiateRegister(name, email, password);
      if (result.otpRequired) {
        setStep('otp');
        toast.success(result.message || 'OTP sent successfully.');
      }
    } catch (authError) {
      setError(authError.message);
      toast.error(authError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setError('');
    setLoading(true);

    try {
      await verifyRegister(email, otp);
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError.message);
      toast.error(authError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');

    try {
      const result = await resendOtp(email, 'register');
      toast.success(result.message || 'OTP resent successfully.');
    } catch (authError) {
      setError(authError.message);
      toast.error(authError.message);
    }
  };

  const handleGoogleCredential = useCallback(async (credential) => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle(credential);
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError.message);
      toast.error(authError.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, redirectTo, signInWithGoogle]);

  return (
    <div className="auth-page auth-register-page">
      <div className="auth-shell">
        <aside className="auth-visual" aria-label="KlickTour travel inspiration">
          <div className="auth-visual-content">
            <span className="auth-kicker">Start planning</span>
            <h1>Turn a place you love into a real trip.</h1>
            <p>Create your account and keep every destination, hotel, and booking in one place.</p>
            <div className="auth-perks" aria-label="KlickTour benefits">
              <span>Curated routes</span>
              <span>Easy bookings</span>
              <span>Trip wishlist</span>
            </div>
          </div>
        </aside>

        <div className="auth-card">
          {step === 'form' ? (
            <>
              <div className="auth-header">
                <img src="/klicktour-logo-dark.png" alt="KlickTour" className="auth-logo-img" />
                <h2>Create Account</h2>
                <p>Join KlickTour and start exploring</p>
              </div>

              {error ? <div className="auth-error">{error}</div> : null}

              <GoogleAuthButton
                mode="signup"
                disabled={loading}
                loading={loading}
                onSuccess={handleGoogleCredential}
                onError={(message) => {
                  setError(message);
                  toast.error(message);
                }}
              />

              <div className="auth-divider"><span>or continue with email</span></div>

              <form onSubmit={handleSubmit}>
                <div className="auth-field">
                  <FaUser className="auth-field-icon" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <FaEnvelope className="auth-field-icon" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <FaLock className="auth-field-icon" />
                  <input
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <div className="auth-field">
                  <FaLock className="auth-field-icon" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Sign Up'}
                </button>
              </form>

              <p className="auth-switch">
                Already have an account? <Link to="/login">Sign In</Link>
              </p>
            </>
          ) : (
            <OtpVerify
              email={email}
              purpose="register"
              onVerify={handleVerifyOtp}
              onResend={handleResend}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
