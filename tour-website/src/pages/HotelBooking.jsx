import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { bookingService } from '../services/bookingService';
import { hotelService } from '../services/hotelService';
import { useAuth } from '../context/AuthContext';
import SelfHealingImage from '../components/common/SelfHealingImage';
import { FaShieldAlt, FaLock, FaCalendarAlt, FaCheckCircle, FaCarSide, FaMapSigns } from 'react-icons/fa';
import { BookingSkeleton } from '../components/Skeleton';

const toDateInput = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const addDays = (base, days) => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

const diffNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return 1;
  return Math.max(Math.round((outDate - inDate) / (1000 * 60 * 60 * 24)), 1);
};

const normalizeBookingForm = (data) => ({
  firstName: String(data.firstName || '').trim(),
  lastName: String(data.lastName || '').trim(),
  email: String(data.email || '').trim(),
  phone: String(data.phone || '').trim(),
  requests: String(data.requests || '').trim(),
});

const HotelBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const restoredCheckout = location.state?.hotelCheckout || {};
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(searchParams.get('room') || '');
  const checkIn = searchParams.get('checkIn') || toDateInput(addDays(new Date(), 1));
  const checkOut = searchParams.get('checkOut') || toDateInput(addDays(new Date(), 3));
  const guestCount = Number(searchParams.get('guests') || 2);

  // Form states
  const [formData, setFormData] = useState({
    firstName: restoredCheckout.formData?.firstName || '',
    lastName: restoredCheckout.formData?.lastName || '',
    email: restoredCheckout.formData?.email || '',
    phone: restoredCheckout.formData?.phone || '',
    requests: restoredCheckout.formData?.requests || '',
  });

  useEffect(() => {
    if (!user) return;
    const [firstName = '', ...lastNameParts] = String(user.name || '').trim().split(/\s+/);
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastNameParts.join(' '),
      email: prev.email || user.email || '',
      phone: prev.phone || user.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const data = await hotelService.getHotelById(id);
        setHotel(data);
        const firstRoom = data?.rooms?.[0];
        const queryRoom = searchParams.get('room');
        setSelectedRoomId(queryRoom || firstRoom?.id || firstRoom?._id || '');
      } catch (err) {
        console.error(err);
        navigate('/hotels');
      } finally {
        setLoading(false);
      }
    };
    fetchHotel();
  }, [id, navigate, searchParams]);

  const selectedRoom = hotel?.rooms?.find((room) => String(room.id || room._id) === String(selectedRoomId))
    || hotel?.rooms?.[0]
    || null;

  const validateBookingDetails = (details) => {
    if (!details.firstName) return 'Please enter your first name before payment.';
    if (!details.email) return 'Please enter your email before payment.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) return 'Please enter a valid email address.';
    if (!details.phone) return 'Please enter your phone number before payment.';
    if (!selectedRoom) return 'Please select a room before booking.';
    if (!Number.isFinite(total) || total <= 0) return 'Booking total is invalid. Please refresh and try again.';
    return '';
  };

  const handleConfirmPay = async () => {
    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            state: {
              hotelCheckout: {
                formData,
                selectedRoomId,
              },
            },
          },
        },
      });
      return;
    }

    const guestDetails = normalizeBookingForm(formData);
    const validationMessage = validateBookingDetails(guestDetails);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await bookingService.createHotelBooking({
        hotelId: hotel._id || hotel.id || id,
        hotelName: hotel.name,
        roomId: selectedRoom?.id || selectedRoom?._id || hotel?.rooms?.[0]?._id || hotel?.rooms?.[0]?.id || `${hotel._id || id}-standard`,
        checkIn,
        checkOut,
        guests: guestCount,
        rooms: 1,
        ...guestDetails,
        lastName: guestDetails.lastName || 'Guest',
        totalPrice: total,
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
      });
      setReservationData(response);
      setIsConfirmed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Booking confirmed! Check your email for details.');
    } catch (e) {
      console.error('Hotel booking error:', e);
      toast.error(
        e?.response?.data?.message ||
        e.message ||
        'Booking failed. Please log in and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <BookingSkeleton />;
  }

  const nights = diffNights(checkIn, checkOut);
  const roomRate = Number(selectedRoom?.price || hotel.pricePerNight || hotel.price || 0);
  const basePrice = roomRate * nights;
  const taxes = basePrice * 0.15;
  const total = basePrice + taxes;

  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0a] min-h-screen pt-24 pb-24">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        <AnimatePresence mode="wait">
          {!isConfirmed ? (
            <motion.div 
              key="booking-form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col lg:flex-row gap-10"
            >
              <div className="flex-1 space-y-8">
                {/* Hotel Header Snippet */}
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 flex items-center gap-6 shadow-sm">
                  <SelfHealingImage
                    src={hotel.heroImage || hotel.image || hotel.images?.[0]}
                    alt={`${hotel.name} | ${hotel.location || hotel.city || ''}`}
                    entityId={hotel._id || hotel.id}
                    type="hotel"
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">{hotel.name}</h2>
                    <p className="text-sm text-gray-500">{hotel.location}</p>
                    <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
                      {selectedRoom?.roomType || selectedRoom?.type || 'Standard Room'}
                    </p>
                    <div className="mt-2 inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-bold uppercase">Best Value</div>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="bg-white dark:bg-[#1e1e1e] p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-12 h-12 bg-blue-600 text-white flex items-center justify-center font-bold text-xl rounded-br-2xl">1</div>
                  <h3 className="text-xl font-bold dark:text-white mb-6 ml-6">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">First Name</label>
                      <input type="text" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Last Name</label>
                      <input type="text" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                      <input type="email" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                      <div className="flex gap-2">
                        <select className="bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm outline-none dark:text-white w-24">
                          <option>+1</option><option>+44</option><option>+91</option>
                        </select>
                        <input type="tel" className="flex-1 bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="123 456 7890" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Special Requests (Optional)</label>
                      <textarea className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white h-24" placeholder="Early check-in, dietary requirements..." value={formData.requests} onChange={e => setFormData({...formData, requests: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-white dark:bg-[#1e1e1e] p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-12 h-12 bg-blue-600 text-white flex items-center justify-center font-bold text-xl rounded-br-2xl">2</div>
                  <h3 className="text-xl font-bold dark:text-white mb-6 ml-6">Payment Information</h3>
                  
                  <div className="flex gap-4 mb-6">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow hover:-translate-y-0.5 transition-transform">Credit Card</button>
                    <button className="px-6 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors">PayPal</button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Card Number</label>
                      <input type="text" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-mono tracking-widest" placeholder="•••• •••• •••• ••••" />
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Expiry Date</label>
                        <input type="text" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="MM/YY" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">CVV</label>
                        <input type="password" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="•••" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl mt-4">
                      <FaShieldAlt size={20} />
                      <p className="text-xs font-medium">Your payment is secured with 256-bit encryption. We never store your card details.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed">By clicking 'Confirm & Pay', you agree to our Terms of Service and Privacy Policy.</p>
                  <button 
                    onClick={handleConfirmPay}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-lg px-10 py-4 rounded-full shadow-xl shadow-blue-500/30 transition-transform active:scale-95"
                  >
                    {isProcessing ? 'Processing securely...' : `Confirm & Pay ₹${total.toLocaleString()}`}
                  </button>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="w-full lg:w-[400px] flex-shrink-0">
                <div className="sticky top-28 bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl">
                  <h3 className="text-xl font-bold dark:text-white mb-6">Your Trip Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-In</div>
                      <div className="text-sm font-bold dark:text-white">{new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Check-Out</div>
                      <div className="text-sm font-bold dark:text-white">{new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Guests</div>
                      <div className="text-sm font-bold dark:text-white">{guestCount} Adults</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Room</div>
                      <div className="text-sm font-bold dark:text-white">{selectedRoom?.roomType || selectedRoom?.type || 'Standard'}</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>{nights} Nights x ₹{hotel.pricePerNight.toLocaleString()}</span>
                      <span>₹{basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>Taxes & VAT</span>
                      <span>₹{taxes.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-zinc-800 mb-8">
                    <span className="font-bold text-gray-900 dark:text-white">Total Price</span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">₹{total.toLocaleString()}</span>
                  </div>

                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-2xl space-y-4">
                    <div className="flex gap-3 text-sm">
                      <FaCalendarAlt className="text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold dark:text-white text-xs mb-1">Cancellation Policy</span>
                        <span className="text-gray-500 text-xs text-balance">Free cancellation before Oct 10. After that, 50% charged.</span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <FaLock className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold dark:text-white text-xs mb-1">Price Guarantee</span>
                        <span className="text-gray-500 text-xs text-balance">If you find a lower price anywhere, we'll match it and give you ₹4,000 credit.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* CONFORMATION SCREEN */
            <motion.div 
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full mb-6">
                  <FaCheckCircle size={40} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black dark:text-white mb-4">Booking Confirmed!</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">Your adventure awaits. A confirmation email has been sent to your inbox.</p>
              </div>

              <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 dark:border-zinc-800 mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-gray-100 dark:border-zinc-800 pb-8 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white mb-6">{hotel.name}</h2>
                    <div className="flex gap-10">
                      <div>
                        <span className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><FaCalendarAlt className="mr-2"/> Check-in</span>
                        <div className="font-bold dark:text-white">{new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div>
                        <span className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2"><FaCalendarAlt className="mr-2"/> Check-out</span>
                        <div className="font-bold dark:text-white">{new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 w-full md:w-auto">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right mb-1">Reservation ID</div>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 text-right mb-4">{reservationData?.reservationId || '#KT-99210'}</div>
                    <div className="space-y-2">
                       <p className="text-xs text-gray-500 flex justify-between gap-4"><span>Room:</span> <span className="font-semibold dark:text-white">{selectedRoom?.roomType || selectedRoom?.type || 'Standard Room'}</span></p>
                       <p className="text-xs text-gray-500 flex justify-between gap-4"><span>Guests:</span> <span className="font-semibold dark:text-white">{guestCount} Adults</span></p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Total</span>
                      <span className="text-lg font-black dark:text-white">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigate('/profile')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                    Go to My Trips &rarr;
                  </button>
                  <button className="flex-1 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 py-4 rounded-xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-zinc-700">
                    Download Receipt
                  </button>
                </div>
              </div>

              {/* Upsell Section */}
              <h3 className="text-2xl font-bold dark:text-white mb-6">Complete your Journey</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center transform transition-transform hover:-translate-y-1 shadow-xl">
                  <FaCarSide size={32} className="mb-4 text-indigo-200" />
                  <h4 className="font-bold text-lg mb-2">Airport Transfer</h4>
                  <p className="text-indigo-200 text-sm mb-6">Pre-book your luxury sedan seamlessly from the airport.</p>
                  <button className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold w-full hover:bg-indigo-50">Add for ₹6,500</button>
                </div>
                <div className="bg-teal-600 rounded-2xl p-6 text-white text-center flex flex-col items-center justify-center transform transition-transform hover:-translate-y-1 shadow-xl">
                  <FaMapSigns size={32} className="mb-4 text-teal-200" />
                  <h4 className="font-bold text-lg mb-2">Local Experiences</h4>
                  <p className="text-teal-200 text-sm mb-6">Book private curated tours around your destination location.</p>
                  <button className="bg-white text-teal-600 px-6 py-2 rounded-full font-bold w-full hover:bg-teal-50">View Experiences</button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default HotelBooking;
