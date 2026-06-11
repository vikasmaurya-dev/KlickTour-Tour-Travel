import React, { useState, useRef, useEffect } from 'react';
import { FaShieldAlt, FaRedo } from 'react-icons/fa';

const OtpVerify = ({ email, onVerify, onResend, loading, error }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newOtp.every((d) => d !== '')) {
      onVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      onVerify(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
      setTimer(300);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      // error handled by parent
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) onVerify(code);
  };

  return (
    <div className="otp-section">
      <div className="otp-icon-wrap">
        <FaShieldAlt className="otp-icon" />
      </div>
      <h2>Verify Your Email</h2>
      <p className="otp-subtitle">
        We've sent a 6-digit code to
        <br />
        <strong>{email}</strong>
      </p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              className="otp-input"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoComplete="off"
            />
          ))}
        </div>

        <div className="otp-timer">
          {timer > 0 ? (
            <span>
              Code expires in <strong>{formatTime(timer)}</strong>
            </span>
          ) : (
            <span className="otp-expired">Code expired</span>
          )}
        </div>

        <button
          type="submit"
          className="auth-btn"
          disabled={loading || otp.join('').length < 6}
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </form>

      <button
        className="otp-resend-btn"
        onClick={handleResend}
        disabled={resending || timer > 270}
      >
        <FaRedo style={{ marginRight: '6px' }} />
        {resending
          ? 'Resending...'
          : timer > 270
            ? `Resend available in ${formatTime(timer - 270)}`
            : 'Resend Code'}
      </button>
    </div>
  );
};

export default OtpVerify;
