import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Shared axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Shared auth headers logic
export const authHeaders = () => {
  const token = localStorage.getItem('klicktour_auth_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAuthHeaders = authHeaders;

// Add request interceptor for auth headers
axiosInstance.interceptors.request.use((config) => {
  const headers = authHeaders();
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

// Shared error handler
const handleError = (error, fallbackMessage) => {
  const message = error.response?.data?.message || error.message || fallbackMessage;
  throw new Error(message);
};

export const api = {
  // ─── Packages ─────────────────────────────────────────────
  getPackages: async (queryString = '') => {
    try {
      const url = queryString ? `/packages?${queryString}` : '/packages';
      const { data } = await axiosInstance.get(url);
      // Return full data object to preserve pagination metadata
      return data;
    } catch (error) {
      handleError(error, 'Failed to fetch packages');
    }
  },

  getPackageById: async (id) => {
    try {
      const { data } = await axiosInstance.get(`/packages/${id}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch package');
    }
  },

  healPackageImage: async (id) => {
    try {
      const { data } = await axiosInstance.patch(`/packages/${id}/heal-image`);
      return data;
    } catch (error) {
      handleError(error, 'Failed to heal image');
    }
  },

  // ─── Destinations ─────────────────────────────────────────
  getDestinations: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'All') params.append('type', filters.type);
      if (filters.budget && filters.budget !== 'All') params.append('budget', filters.budget);
      if (filters.duration && filters.duration !== 'All') params.append('duration', filters.duration);
      const { data } = await axiosInstance.get('/destinations', { params });
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch destinations');
    }
  },

  getDestinationById: async (id) => {
    try {
      const { data } = await axiosInstance.get(`/destinations/${id}`);
      // The backend returns { success, data, packages, hotels, transportations }
      // We need to merge packages/hotels/transportations into the destination object
      // so callers can access them as destData.packages, destData.hotels, etc.
      if (data.data !== undefined) {
        return {
          ...data.data,
          packages: data.packages || [],
          hotels: data.hotels || [],
          transportations: data.transportations || [],
        };
      }
      return data;
    } catch (error) {
      handleError(error, 'Failed to fetch destination');
    }
  },

  healDestinationImage: async (id) => {
    try {
      const { data } = await axiosInstance.patch(`/destinations/${id}/heal-image`);
      return data;
    } catch (error) {
      handleError(error, 'Failed to heal image');
    }
  },

  healHotelImage: async (id) => {
    try {
      const { data } = await axiosInstance.patch(`/hotels/${id}/heal-image`);
      return data;
    } catch (error) {
      handleError(error, 'Failed to heal image');
    }
  },

  healTransportationImage: async (id) => {
    try {
      const { data } = await axiosInstance.patch(`/transportation/${id}/heal-image`);
      return data;
    } catch (error) {
      handleError(error, 'Failed to heal image');
    }
  },

  // ─── Contact ──────────────────────────────────────────────
  sendContactMessage: async (contactData) => {
    try {
      const { data } = await axiosInstance.post('/contact', contactData);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to send message');
    }
  },

  getContacts: async () => {
    try {
      const { data } = await axiosInstance.get('/contact');
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch contacts');
    }
  },

  markContactRead: async (id) => {
    try {
      const { data } = await axiosInstance.patch(`/contact/${id}/read`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to mark as read');
    }
  },

  // ─── Admin CRUD (Protected) ───────────────────────────────
  createPackage: async (payload) => {
    try {
      const { data } = await axiosInstance.post('/packages', payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to create package');
    }
  },

  updatePackage: async (id, payload) => {
    try {
      const { data } = await axiosInstance.put(`/packages/${id}`, payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to update package');
    }
  },

  deletePackage: async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/packages/${id}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to delete package');
    }
  },

  createDestination: async (payload) => {
    try {
      const { data } = await axiosInstance.post('/destinations', payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to create destination');
    }
  },

  updateDestination: async (id, payload) => {
    try {
      const { data } = await axiosInstance.put(`/destinations/${id}`, payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to update destination');
    }
  },

  deleteDestination: async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/destinations/${id}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to delete destination');
    }
  },

  // Wishlist
  getWishlist: async () => {
    try {
      const { data } = await axiosInstance.get('/wishlist');
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch wishlist');
    }
  },

  toggleWishlist: async (item) => {
    try {
      const { data } = await axiosInstance.post('/wishlist', item);
      return data;
    } catch (error) {
      handleError(error, 'Failed to update wishlist');
    }
  },

  removeWishlistItem: async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/wishlist/${id}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to remove wishlist item');
    }
  },

  // Reviews
  getReviews: async (targetType, targetId) => {
    try {
      const { data } = await axiosInstance.get(`/reviews/${targetType}/${targetId}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch reviews');
    }
  },

  saveReview: async (reviewData) => {
    try {
      const { data } = await axiosInstance.post('/reviews', reviewData);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to save review');
    }
  },

  getAllReviews: async () => {
    try {
      const { data } = await axiosInstance.get('/reviews/all');
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch reviews');
    }
  },

  deleteReview: async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/reviews/${id}`);
      return data;
    } catch (error) {
      handleError(error, 'Failed to delete review');
    }
  },

  // Users
  getUsers: async () => {
    try {
      const { data } = await axiosInstance.get('/admin/users');
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch users');
    }
  },

  deleteUser: async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/admin/users/${id}`);
      return data;
    } catch (error) {
      handleError(error, 'Failed to delete user');
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const { data } = await axiosInstance.patch(`/admin/users/${id}/role`, { role });
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to update user role');
    }
  },

  // Admin analytics and coupons
  getAdminAnalytics: async () => {
    try {
      const { data } = await axiosInstance.get('/admin/analytics');
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch analytics');
    }
  },

  getAuditLogs: async (filters = {}) => {
    try {
      const { data } = await axiosInstance.get('/admin/audit-logs', { params: filters });
      return data;
    } catch (error) {
      handleError(error, 'Failed to fetch audit logs');
    }
  },

  purgeAuditLogs: async () => {
    try {
      const { data } = await axiosInstance.delete('/admin/audit-logs');
      return data;
    } catch (error) {
      handleError(error, 'Failed to purge audit logs');
    }
  },

  getCoupons: async () => {
    try {
      const { data } = await axiosInstance.get('/coupons');
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch coupons');
    }
  },

  validateCoupon: async (code, amount) => {
    try {
      const { data } = await axiosInstance.post('/coupons/validate', { code, amount });
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to validate coupon');
    }
  },

  createCoupon: async (payload) => {
    try {
      const { data } = await axiosInstance.post('/coupons', payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to create coupon');
    }
  },

  updateCoupon: async (id, payload) => {
    try {
      const { data } = await axiosInstance.put(`/coupons/${id}`, payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to update coupon');
    }
  },

  deleteCoupon: async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/coupons/${id}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to delete coupon');
    }
  },

  // ─── Search & AI ─────────────────────────────────────────
  searchPlace: async (query) => {
    try {
      const { data } = await axiosInstance.get('/search/place', { params: { q: query } });
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Search failed');
    }
  },

  searchPackage: async (query) => {
    try {
      const { data } = await axiosInstance.get('/packages/search', { params: { query } });
      return data; // Returns { success, isNew, data }
    } catch (error) {
      handleError(error, 'Package Search failed');
    }
  },

  aiSearchPackage: async (query) => {
    try {
      const { data } = await axiosInstance.post('/packages/ai-search', { query });
      return data; // Returns { success, isNew, data }
    } catch (error) {
      handleError(error, 'AI Package Search failed');
    }
  },

  aiSearchDestination: async (query) => {
    try {
      const { data } = await axiosInstance.post('/destinations/ai-search', { query });
      return data; // Returns { success, isNew, data }
    } catch (error) {
      handleError(error, 'AI Destination Search failed');
    }
  },

  generateAITrip: async (prompt) => {
    try {
      const { data } = await axiosInstance.post('/ai/generate-trip', { prompt });
      return data;
    } catch (error) {
      handleError(error, 'Failed to generate trip');
    }
  },

  getAITripById: async (id) => {
    try {
      const { data } = await axiosInstance.get(`/ai/trips/${id}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch generated trip');
    }
  },

  resolveSmartImages: async (payload) => {
    try {
      const { data } = await axiosInstance.post('/images/resolve', payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to resolve smart images');
    }
  },
};

export { handleError };
