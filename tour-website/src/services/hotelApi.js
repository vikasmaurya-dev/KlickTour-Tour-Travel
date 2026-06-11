import { bookingService } from './bookingService';
import { hotelService } from './hotelService';

export const hotelApi = {
  ...hotelService,
  createBooking: bookingService.createHotelBooking,
};
