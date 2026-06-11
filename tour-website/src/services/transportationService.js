import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const authHeaders = () => {
  const token = localStorage.getItem('klicktour_auth_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const unwrapList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const transportApi = axios.create({
  baseURL: `${API_URL}/transportation`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const transportationService = {
  /**
   * Get all transportation with filtering, sorting, pagination
   */
  getAll: async (params = {}) => {
    try {
      const { data } = await transportApi.get('/', { params });
      const list = unwrapList(data);
      list.total = data?.total;
      list.totalPages = data?.totalPages;
      list.page = data?.page;
      list.count = data?.count;
      return list;
    } catch (error) {
      console.error('Error fetching transportation:', error);
      throw error;
    }
  },

  /**
   * Get featured transportation
   */
  getFeatured: async () => {
    try {
      const { data } = await transportApi.get('/featured');
      return unwrapList(data);
    } catch (error) {
      console.error('Error fetching featured transportation:', error);
      throw error;
    }
  },

  /**
   * Search transportation
   */
  search: async (params = {}) => {
    try {
      const { data } = await transportApi.get('/search', { params });
      return unwrapList(data);
    } catch (error) {
      console.error('Error searching transportation:', error);
      throw error;
    }
  },

  /**
   * Complex filter (POST body)
   */
  filter: async (filterBody = {}) => {
    try {
      const { data } = await transportApi.post('/filter', filterBody);
      return unwrapList(data);
    } catch (error) {
      console.error('Error filtering transportation:', error);
      throw error;
    }
  },

  /**
   * Get all unique cities for autocomplete
   */
  getCities: async () => {
    try {
      const { data } = await transportApi.get('/cities');
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },

  /**
   * Get single transport by ID
   */
  getById: async (id) => {
    try {
      const { data } = await transportApi.get(`/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching transport by ID:', error);
      throw error;
    }
  },
  /**
   * Create new transport (admin)
   */
  create: async (payload) => {
    const { data } = await transportApi.post('/', payload, { headers: authHeaders() });
    return data;
  },

  /**
   * Update transport by ID (admin)
   */
  update: async (id, payload) => {
    const { data } = await transportApi.put(`/${id}`, payload, { headers: authHeaders() });
    return data;
  },

  /**
   * Delete transport by ID (admin)
   */
  delete: async (id) => {
    const { data } = await transportApi.delete(`/${id}`, { headers: authHeaders() });
    return data;
  },
};

// Named export for admin modules
export { transportationService };
export default transportationService;
