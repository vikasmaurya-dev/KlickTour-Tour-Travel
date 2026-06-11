import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AUTH_TOKEN_KEY = 'klicktour_auth_token';
export const AUTH_USER_KEY = 'klicktour_auth_user';

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const normalizeError = (error, fallbackMessage) => {
  const message = error.response?.data?.message || error.message || fallbackMessage;
  throw new Error(message);
};

const normalizeAuthPayload = (payload) => {
  const user = payload.user || payload.data || {};
  return {
    success: payload.success ?? true,
    message: payload.message || '',
    otpRequired: Boolean(payload.otpRequired),
    email: payload.email || user.email || '',
    token: payload.token || '',
    user,
  };
};

export const persistAuthSession = (authPayload) => {
  const normalized = normalizeAuthPayload(authPayload);

  if (normalized.token) {
    localStorage.setItem(AUTH_TOKEN_KEY, normalized.token);
    localStorage.setItem('token', normalized.token);
  }

  if (normalized.user && normalized.user._id) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalized.user));
  }

  return normalized;
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem('token');
};

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem(AUTH_USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const authService = {
  async register(payload) {
    try {
      const { data } = await authApi.post('/register', payload);
      return normalizeAuthPayload(data);
    } catch (error) {
      normalizeError(error, 'Registration failed.');
    }
  },

  async verifyRegister(email, otp) {
    try {
      const { data } = await authApi.post('/verify-register', { email, otp });
      return normalizeAuthPayload(data);
    } catch (error) {
      normalizeError(error, 'Verification failed.');
    }
  },

  async login(payload) {
    try {
      const { data } = await authApi.post('/login', payload);
      return normalizeAuthPayload(data);
    } catch (error) {
      normalizeError(error, 'Login failed.');
    }
  },

  async verifyLogin(email, otp) {
    try {
      const { data } = await authApi.post('/verify-login', { email, otp });
      return normalizeAuthPayload(data);
    } catch (error) {
      normalizeError(error, 'Verification failed.');
    }
  },

  async googleAuth(credential) {
    try {
      const { data } = await authApi.post('/google', { credential });
      return normalizeAuthPayload(data);
    } catch (error) {
      normalizeError(error, 'Google sign-in failed.');
    }
  },

  async forgotPassword(email) {
    try {
      const { data } = await authApi.post('/forgot-password', { email });
      return data;
    } catch (error) {
      normalizeError(error, 'Failed to send OTP.');
    }
  },

  async resetPassword(email, otp, newPassword) {
    try {
      const { data } = await authApi.post('/reset-password', { email, otp, newPassword });
      return data;
    } catch (error) {
      normalizeError(error, 'Password reset failed.');
    }
  },

  async resendOtp(email, purpose) {
    try {
      const { data } = await authApi.post('/resend-otp', { email, purpose });
      return data;
    } catch (error) {
      normalizeError(error, 'Failed to resend OTP.');
    }
  },

  async getMe() {
    try {
      const { data } = await authApi.get('/me');
      return normalizeAuthPayload(data);
    } catch (error) {
      normalizeError(error, 'Not authenticated.');
    }
  },

  async updateProfile(payload) {
    try {
      const { data } = await authApi.put('/profile', payload);
      return normalizeAuthPayload(data);
    } catch (error) {
      normalizeError(error, 'Failed to update profile.');
    }
  },
};
