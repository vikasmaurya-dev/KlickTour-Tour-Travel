import { axiosInstance, handleError } from './api';

export const hotelService = {
  getHotels: async (filters = {}) => {
    try {
      const { destination, location, packageId, destinationId, minPrice, maxPrice, stars, amenities, limit } = filters;
      const params = new URLSearchParams();
      if (destination) params.append('destination', destination);
      if (location) params.append('location', location);
      if (packageId) params.append('packageId', packageId);
      if (destinationId) params.append('destinationId', destinationId);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (stars) params.append('stars', stars);
      if (limit) params.append('limit', limit);
      
      const { data } = await axiosInstance.get('/hotels', { params });
      let result = data.data !== undefined ? data.data : data;

      if (amenities && amenities.length > 0) {
        result = result.filter((h) => amenities.every((a) => (h.amenities || []).includes(a)));
      }
      return result;
    } catch (error) {
      handleError(error, 'Failed to fetch hotels');
    }
  },

  getHotelById: async (id) => {
    try {
      const { data } = await axiosInstance.get(`/hotels/${id}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch hotel details');
    }
  },

  createHotel: async (payload) => {
    try {
      const { data } = await axiosInstance.post('/hotels', payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to create hotel');
    }
  },

  updateHotel: async (id, payload) => {
    try {
      const { data } = await axiosInstance.put(`/hotels/${id}`, payload);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to update hotel');
    }
  },

  deleteHotel: async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/hotels/${id}`);
      return data;
    } catch (error) {
      handleError(error, 'Failed to delete hotel');
    }
  }
};
