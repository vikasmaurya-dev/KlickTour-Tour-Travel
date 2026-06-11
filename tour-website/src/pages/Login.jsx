import React, { useCallback, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import OtpVerify from '../components/OtpVerify';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('credentials');
  const { initiateLogin, verifyLogin, completeLogin, signInWithGoogle, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => {
    const from = location.state?.from;
    if (!from) return '/';
    return `${from.pathname || '/'}${from.search || ''}${from.hash || ''}`;
  }, [location.state]);
  const redirectState = useMemo(() => location.state?.from?.state || null, [location.state]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await initiateLogin(email, password);

      if (result.otpRequired) {
        setStep('otp');
        toast.success(result.message || 'OTP sent successfully.');
      } else if (result.token) {
        completeLogin(result);
        navigate(redirectTo, { replace: true, state: redirectState });
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
      await verifyLogin(email, otp);
      navigate(redirectTo, { replace: true, state: redirectState });
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
      const result = await resendOtp(email, 'login');
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
      navigate(redirectTo, { replace: true, state: redirectState });
    } catch (authError) {
      setError(authError.message);
      toast.error(authError.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, redirectState, redirectTo, signInWithGoogle]);

  return (
    <div className="auth-page auth-login-page">
      <div className="auth-shell">
        <aside className="auth-visual" aria-label="KlickTour travel inspiration">
          <div className="auth-visual-content">
            <span className="auth-kicker">Your next escape</span>
            <h1>Pick up where the journey paused.</h1>
            <p>Saved trips, quick bookings, and handpicked places are ready when you are.</p>
            <div className="auth-perks" aria-label="KlickTour benefits">
              <span>Flexible plans</span>
              <span>Verified stays</span>
              <span>Local support</span>
            </div>
          </div>
        </aside>

        <div className="auth-card">
          {step === 'credentials' ? (
            <>
              <div className="auth-header">
                <img src="/klicktour-logo-dark.png" alt="KlickTour" className="auth-logo-img" />
                <h2>Welcome Back</h2>
                <p>Sign in to your KlickTour account</p>
              </div>

              {error ? <div className="auth-error">{error}</div> : null}

              <GoogleAuthButton
                mode="signin"
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
                    placeholder="Password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                <div className="auth-forgot">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>

                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Verifying...' : 'Sign In'}
                </button>
              </form>

              <p className="auth-switch">
                Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
              </p>
            </>
          ) : (
            <OtpVerify
              email={email}
              purpose="login"
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

export default Login;
