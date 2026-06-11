import React, { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { FaSpinner } from 'react-icons/fa';
import {
  extractGoogleCredential,
  isGoogleAuthConfigured,
  normalizeGoogleAuthError,
} from '../../utils/googleAuth';

const GoogleAuthButton = ({
  mode = 'signin',
  loading = false,
  disabled = false,
  onSuccess,
  onError,
}) => {
  const buttonWrapRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(360);

  useEffect(() => {
    if (!buttonWrapRef.current) {
      return undefined;
    }

    const updateWidth = () => {
      setButtonWidth(Math.max(220, Math.round(buttonWrapRef.current?.offsetWidth || 360)));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(buttonWrapRef.current);

    return () => observer.disconnect();
  }, []);

  const handleSuccess = (response) => {
    const credential = extractGoogleCredential(response);

    if (!credential) {
      onError?.('Google did not return a valid credential. Please try again.');
      return;
    }

    onSuccess?.(credential);
  };

  if (!isGoogleAuthConfigured) {
    return (
      <button type="button" className="google-auth-fallback" disabled>
        Google sign-in is not configured
      </button>
    );
  }

  return (
    <div
      className={`google-auth-button ${loading || disabled ? 'is-disabled' : ''}`}
      aria-busy={loading}
      ref={buttonWrapRef}
    >
      <div className="google-auth-button__surface">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError?.(normalizeGoogleAuthError())}
          theme="filled_black"
          text={mode === 'signup' ? 'continue_with' : 'continue_with'}
          shape="rectangular"
          size="large"
          width={`${buttonWidth}`}
          useOneTap={false}
        />
      </div>

      {loading ? (
        <div className="google-auth-button__overlay">
          <FaSpinner className="google-auth-button__spinner" />
          <span>{mode === 'signup' ? 'Creating account...' : 'Signing you in...'}</span>
        </div>
      ) : null}
    </div>
  );
};

export default GoogleAuthButton;
