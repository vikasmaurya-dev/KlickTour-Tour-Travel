import { OAuth2Client } from 'google-auth-library';

let googleClient;

export const getGoogleAuthClient = () => {
  if (!googleClient) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  return googleClient;
};

export const verifyGoogleCredential = async (credential) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const error = new Error('Google authentication is not configured on the server.');
    error.statusCode = 500;
    throw error;
  }

  if (!credential) {
    const error = new Error('Google credential is required.');
    error.statusCode = 400;
    throw error;
  }

  const ticket = await getGoogleAuthClient().verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload?.email || !payload?.email_verified) {
    const error = new Error('Google account could not be verified.');
    error.statusCode = 401;
    throw error;
  }

  return {
    googleId: payload.sub,
    name: payload.name || payload.email.split('@')[0],
    email: payload.email.toLowerCase(),
    avatar: payload.picture || '',
  };
};
