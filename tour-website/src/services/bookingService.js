import { axiosInstance, handleError } from './api';

export const bookingService = {
  createPackageBooking: async (bookingData) => {
    try {
      const { data } = await axiosInstance.post('/bookings', bookingData);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to create package booking');
    }
  },

  createHotelBooking: async (bookingData) => {
    try {
      const { data } = await axiosInstance.post('/hotels/booking', bookingData);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to create hotel booking');
    }
  },

  getBookings: async () => {
    try {
      const { data } = await axiosInstance.get('/bookings');
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch bookings');
    }
  },

  getMyBookings: async () => {
    try {
      const { data } = await axiosInstance.get('/bookings/my');
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to fetch your bookings');
    }
  },

  updateBookingStatus: async (id, status) => {
    try {
      const { data } = await axiosInstance.patch(`/bookings/${id}/status`, { status });
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to update booking status');
    }
  },

  deleteBooking: async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/bookings/${id}`);
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      handleError(error, 'Failed to delete booking');
    }
  }
};
