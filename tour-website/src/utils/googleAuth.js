export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const isGoogleAuthConfigured = Boolean(GOOGLE_CLIENT_ID);

export const extractGoogleCredential = (response) => response?.credential || '';

export const normalizeGoogleAuthError = (fallback = 'Google authentication failed. Please try again.') => fallback;

export const getUserFirstName = (name = '') => {
  const [firstName] = name.trim().split(/\s+/);
  return firstName || 'Traveler';
};
