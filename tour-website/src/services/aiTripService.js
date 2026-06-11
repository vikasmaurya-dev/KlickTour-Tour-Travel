import { axiosInstance } from './api';

const unwrapData = (data) => (data?.data !== undefined ? data.data : data);

export const aiTripService = {
  generateTrip: async (prompt) => {
    const { data } = await axiosInstance.post('/ai/generate-trip', { prompt });
    return data;
  },

  getTripById: async (id) => {
    const { data } = await axiosInstance.get(`/ai/trips/${id}`);
    return unwrapData(data);
  },
};
