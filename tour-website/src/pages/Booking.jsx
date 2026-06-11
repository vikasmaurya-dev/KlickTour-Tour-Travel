import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaUsers, 
  FaCommentAlt, FaCreditCard, FaMobileAlt, FaUniversity,
  FaCheckCircle, FaLock, FaArrowRight, FaTicketAlt,
  FaHotel, FaMapMarkerAlt, FaStar, FaBed
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { api } from '../services/api';
import { bookingService } from '../services/bookingService';
import { hotelService } from '../services/hotelService';
import { useAuth } from '../context/AuthContext';
import { BookingSkeleton } from '../components/Skeleton';
import SelfHealingImage from '../components/common/SelfHealingImage';
import { getHotelFallbackImages, imageKey } from '../utils/imageHelper';
import toast from 'react-hot-toast';
import './Booking.css';

const parseHotelNights = (duration = '') => {
  const text = String(duration || '').toLowerCase();
  if (!text) return 1;

  const nightsMatch = text.match(/(\d+)\s*nights?/i);
  if (nightsMatch) return Math.max(1, Number(nightsMatch[1]));

  const daysMatch = text.match(/(\d+)\s*days?/i);
  if (daysMatch) return Math.max(1, Number(daysMatch[1]) - 1);

  const anyNumber = text.match(/(\d+)/);
  return anyNumber ? Math.max(1, Number(anyNumber[1]) - 1) : 1;
};

const fallbackHotelName = (entry, index, destination) => {
  if (typeof entry === 'string') return entry;
  return entry?.name || entry?.title || `${destination || 'Destination'} Premium Stay ${index + 1}`;
};

const buildFallbackHotels = (entries = [], packageData = {}) => {
  const sourceEntries = entries.length > 0
    ? entries
    : [
        { name: `${packageData.location || packageData.name || 'Destination'} Grand Retreat` },
        { name: `${packageData.location || packageData.name || 'Destination'} Boutique Suites` },
      ];

  return sourceEntries.slice(0, 4).map((entry, index) => {
    const hotel = typeof entry === 'string' ? { name: entry } : entry || {};
    const fallbackImages = getHotelFallbackImages({
      name: hotel.name || hotel.title || packageData.name,
      location: hotel.location || packageData.location,
      category: packageData.category || 'hotel',
    });
    const image = hotel.heroImage || hotel.image || hotel.images?.[0] || fallbackImages[index % fallbackImages.length];
    const price = Number(hotel.pricePerNight || hotel.price || Math.max(3500, Math.round(Number(packageData.price || 25000) * 0.12)));

    return {
      ...hotel,
      _id: hotel._id || hotel.id || `fallback-hotel-${index + 1}`,
      id: hotel.id || hotel._id || `fallback-hotel-${index + 1}`,
      name: fallbackHotelName(hotel, index, packageData.location || packageData.name),
      location: hotel.location || packageData.location || 'Selected destination',
      city: hotel.city || hotel.location || packageData.location || 'Selected destination',
      rating: Number(hotel.rating || 4.7),
      pricePerNight: price,
      price,
      roomType: hotel.roomType || hotel.rooms?.[0]?.roomType || 'Standard Room',
      heroImage: image,
      image,
      images: hotel.images?.length ? hotel.images : [image],
      amenities: hotel.amenities?.length ? hotel.amenities : ['Free WiFi', 'Breakfast', 'Room Service', 'Travel Desk'],
      rooms: hotel.rooms?.length ? hotel.rooms : [{ id: `fallback-room-${index + 1}`, roomType: hotel.roomType || 'Standard Room', price }],
    };
  });
};

const ensureDistinctHotelImages = (hotelList = [], packageData = {}) => {
  const used = new Set();

  return hotelList.map((hotel, index) => {
    const candidates = [
      hotel.heroImage,
      hotel.image,
      ...(hotel.images || []),
      ...(hotel.imagePool || []),
      ...getHotelFallbackImages({
        name: hotel.name || packageData.name,
        location: hotel.location || hotel.city || packageData.location,
        category: packageData.category || 'hotel',
      }),
    ].filter(Boolean);
    const nextImage = candidates.find((candidate) => !used.has(imageKey(candidate))) || candidates[index % candidates.length];
    if (nextImage) used.add(imageKey(nextImage));

    return nextImage
      ? {
          ...hotel,
          heroImage: nextImage,
          image: nextImage,
          images: [nextImage, ...(hotel.images || []).filter((img) => imageKey(img) !== imageKey(nextImage))],
        }
      : hotel;
  });
};

const HotelChoiceCard = ({ hotel, selected, onSelect, nights }) => {
  const hotelId = hotel._id || hotel.id;
  const heroImage = hotel.heroImage || hotel.image || hotel.images?.[0] || hotel.gallery?.[0];
  const roomType = hotel.roomType || hotel.rooms?.[0]?.roomType || 'Standard Room';
  const amenities = (hotel.amenities || []).slice(0, 4);

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(hotel)}
      className={`hotel-choice-card ${selected ? 'selected' : ''}`}
    >
      <div className="hotel-choice-image-wrap">
        <SelfHealingImage
          src={heroImage}
          alt={hotel.name}
          entityId={hotelId}
          type="hotel"
          className="hotel-choice-image"
        />
        <div className="hotel-choice-price">
          <span>From</span>
          <strong>₹{Number(hotel.pricePerNight || hotel.price || 0).toLocaleString()}</strong>
          <small>/night</small>
        </div>
      </div>

      <div className="hotel-choice-body">
        <div className="hotel-choice-topline">
          <div>
            <h3>{hotel.name}</h3>
            <p><FaMapMarkerAlt /> {hotel.location || hotel.city || 'Selected destination'}</p>
          </div>
          <div className="hotel-choice-rating">
            <FaStar />
            <span>{Number(hotel.rating || 0).toFixed(1)}</span>
          </div>
        </div>

        <div className="hotel-choice-room">
          <FaBed />
          <span>{roomType}</span>
        </div>

        <div className="hotel-choice-amenities">
          {amenities.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="hotel-choice-footer">
          <div>
            <strong>₹{(Number(hotel.pricePerNight || hotel.price || 0) * nights).toLocaleString()}</strong>
            <span>{nights} night{nights > 1 ? 's' : ''}</span>
          </div>
          <span className="hotel-choice-action">{selected ? 'Selected' : 'Select Hotel'}</span>
        </div>
      </div>
    </motion.button>
  );
};

const Booking = () => {
  const { id: pkgId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract passed state with fallbacks
  const passedState = location.state || {};
  const restoredCheckout = passedState.packageCheckout || {};
  
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(!passedState.packageId); // Don't show skeleton if we have basic data
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [travelers, setTravelers] = useState(restoredCheckout.travelers || passedState.travelersCount || 1);
  const [couponCode, setCouponCode] = useState(restoredCheckout.couponCode || '');
  const [coupon, setCoupon] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState('');
  const [selectedHotelId, setSelectedHotelId] = useState(restoredCheckout.selectedHotelId || '');

  const [formData, setFormData] = useState({
    fullName: restoredCheckout.formData?.fullName || '',
    email: restoredCheckout.formData?.email || '',
    phone: restoredCheckout.formData?.phone || '',
    travelDate: restoredCheckout.formData?.travelDate || passedState.selectedDate || '',
    specialRequests: restoredCheckout.formData?.specialRequests || '',
    paymentMethod: restoredCheckout.formData?.paymentMethod || 'Card',
  });

  // Auto-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPkg = async () => {
      try {
        const data = await api.getPackageById(pkgId);
        setPkg(data);
      } catch (err) {
        toast.error('Failed to load package details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPkg();
  }, [pkgId]);

  // Use passed data if package isn't loaded yet
  const displayPkg = useMemo(() => pkg || {
    _id: passedState.packageId,
    name: passedState.packageName,
    image: passedState.packageImage,
    duration: passedState.duration,
    location: passedState.location,
    price: passedState.basePrice,
    rating: 5
  }, [
    pkg,
    passedState.basePrice,
    passedState.duration,
    passedState.location,
    passedState.packageId,
    passedState.packageImage,
    passedState.packageName,
  ]);

  useEffect(() => {
    const loadHotels = async () => {
      const destinationHint = pkg?.location || passedState.location || pkg?.name || passedState.packageName || '';
      if (!destinationHint) return;
      const fallbackHotels = buildFallbackHotels(
        passedState.packageHotels || pkg?.hotels || pkg?.hotelsInfo || [],
        pkg || displayPkg
      );

      setHotelsLoading(true);
      setHotelsError('');
      try {
        const data = await hotelService.getHotels({
          destination: destinationHint,
          packageId: pkg?._id || passedState.packageId,
          destinationId: pkg?.destinationId || passedState.destinationId,
          location: destinationHint,
          limit: 4,
        });
        const normalizedHotels = Array.isArray(data) ? data : data?.data || [];
        const nextHotels = normalizedHotels.length > 0 ? normalizedHotels.slice(0, 4) : fallbackHotels;
        setHotels(ensureDistinctHotelImages(nextHotels, displayPkg));
        setHotelsError('');
      } catch (error) {
        console.error('Failed to load package hotels:', error);
        setHotels(ensureDistinctHotelImages(fallbackHotels, displayPkg));
        setHotelsError(fallbackHotels.length > 0 ? '' : (error.message || 'Unable to load hotels for this destination.'));
      } finally {
        setHotelsLoading(false);
      }
    };

    if (pkg?.name || passedState.packageName) {
      loadHotels();
    }
  }, [
    displayPkg,
    passedState.destinationId,
    passedState.location,
    passedState.packageHotels,
    passedState.packageId,
    passedState.packageName,
    pkg,
  ]);

  useEffect(() => {
    if (hotels.length === 0) return;

    const selectedStillExists = hotels.some((hotel) => String(hotel._id || hotel.id) === String(selectedHotelId));
    if (!selectedStillExists) {
      const firstHotelId = hotels[0]._id || hotels[0].id;
      if (firstHotelId) setSelectedHotelId(String(firstHotelId));
    }
  }, [hotels, selectedHotelId]);

  const basePrice = displayPkg.price || 0;
  const hotelNights = parseHotelNights(displayPkg.duration || passedState.duration || '');
  const selectedHotel = useMemo(
    () => hotels.find((hotel) => String(hotel._id || hotel.id) === String(selectedHotelId)) || null,
    [hotels, selectedHotelId]
  );
  const packageSubtotal = basePrice * travelers;
  const hotelSubtotal = selectedHotel ? (Number(selectedHotel.pricePerNight || selectedHotel.price || 0) * hotelNights) : 0;
  const bookingBaseAmount = packageSubtotal + hotelSubtotal;
  const totalPrice = coupon ? coupon.finalAmount : bookingBaseAmount;
  const appliedCouponCode = coupon?.code;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTravelers = (type) => {
    if (type === 'inc') setTravelers(prev => prev + 1);
    else if (type === 'dec' && travelers > 1) setTravelers(prev => prev - 1);
  };

  useEffect(() => {
    if (!appliedCouponCode || !couponCode.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const data = await api.validateCoupon(couponCode, bookingBaseAmount);
        setCoupon(data);
      } catch (err) {
        setCoupon(null);
        toast.error(err.message || 'Coupon no longer applies to this updated total.');
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [appliedCouponCode, bookingBaseAmount, couponCode]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    try {
      const data = await api.validateCoupon(couponCode, bookingBaseAmount);
      setCoupon(data);
      toast.success(`Coupon applied! Saved ₹${data.discountAmount}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            state: {
              ...passedState,
              packageCheckout: {
                formData,
                travelers,
                selectedHotelId,
                couponCode,
              },
            },
          },
        },
      });
      return;
    }
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.travelDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedHotel) {
      toast.error('Please select a hotel before booking.');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await bookingService.createPackageBooking({
        packageId: pkgId,
        packageName: displayPkg.name,
        packageImage: displayPkg.image || displayPkg.heroImage,
        packageLocation: displayPkg.location,
        packageSubtotal,
        locationKey: selectedHotel.locationKey || '',
        hotelId: selectedHotel._id || selectedHotel.id,
        hotelName: selectedHotel.name,
        hotelLocation: selectedHotel.location || selectedHotel.city,
        hotelImage: selectedHotel.heroImage || selectedHotel.image || selectedHotel.images?.[0],
        hotelPricePerNight: Number(selectedHotel.pricePerNight || selectedHotel.price || 0),
        hotelRating: Number(selectedHotel.rating || 0),
        hotelAmenities: selectedHotel.amenities || [],
        hotelRoomType: selectedHotel.roomType || selectedHotel.rooms?.[0]?.roomType || 'Standard Room',
        hotelNights,
        hotelSubtotal,
        ...formData,
        travelers,
        totalPrice: bookingBaseAmount,
        couponCode: coupon?.code || '',
      });
      setBookingDetails(booking);
      setShowSuccess(true);
      toast.success('Booking Successful!');
    } catch (err) {
      toast.error(err.message || 'Booking failed. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !displayPkg.name) return <BookingSkeleton />;

  return (
    <div className="booking-page">
      {/* Premium Header */}
      <section className="booking-header-section">
        {displayPkg.image && <img src={displayPkg.image} alt={displayPkg.name} className="header-bg-image" />}
        <div className="header-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>Finalize Your Journey</h1>
            <div className="breadcrumb">
              <Link to="/">Home</Link> • <Link to="/packages">Packages</Link> • <span className="active">{displayPkg.name || 'Booking'}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="booking-container">
        {/* Left Column: Form */}
        <motion.div 
          className="booking-main"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="booking-steps-nav mb-4">
            <div className="step-indicator active"><span>1</span> Details</div>
            <div className="step-line"></div>
            <div className="step-indicator"><span>2</span> Stay</div>
            <div className="step-line"></div>
            <div className="step-indicator"><span>3</span> Payment</div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Traveler Details */}
            <div className="glass-panel mb-4">
              <div className="section-label">
                <div className="label-number">1</div>
                <h2>Traveler Information</h2>
              </div>
              
              <div className="input-grid">
                <div className="form-field">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input 
                      type="text" 
                      name="fullName" 
                      required 
                      placeholder="e.g. Alexander Pierce" 
                      value={formData.fullName} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      placeholder="alex@example.com" 
                      value={formData.email} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              <div className="input-grid">
                <div className="form-field">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <FaPhone className="input-icon" />
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      placeholder="+91 98765 43210" 
                      value={formData.phone} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Travel Date</label>
                  <div className="input-wrapper">
                    <FaCalendarAlt className="input-icon" />
                    <input 
                      type="date" 
                      name="travelDate" 
                      required 
                      value={formData.travelDate} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              <div className="form-field mb-4">
                <label>Number of Travelers</label>
                <div className="travelers-selector">
                  <button type="button" className="counter-btn" onClick={() => handleTravelers('dec')} disabled={travelers <= 1}>-</button>
                  <span className="traveler-count">{travelers}</span>
                  <button type="button" className="counter-btn" onClick={() => handleTravelers('inc')}>+</button>
                  <span className="traveler-label"><FaUsers /> {travelers > 1 ? 'Travelers' : 'Traveler'}</span>
                </div>
              </div>

              <div className="form-field">
                <label>Special Requests (Optional)</label>
                <div className="input-wrapper" style={{alignItems: 'flex-start'}}>
                  <FaCommentAlt className="input-icon" style={{marginTop: '15px'}} />
                  <textarea 
                    name="specialRequests" 
                    rows="3" 
                    placeholder="Any specific needs or preferences?"
                    value={formData.specialRequests} 
                    onChange={handleChange}
                    style={{paddingLeft: '42px'}}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Step 2: Hotel Selection */}
            <div className="glass-panel mb-4">
              <div className="section-label">
                <div className="label-number">2</div>
                <h2>Select Your Hotel</h2>
              </div>
              <p className="hotel-section-note">
                Pick one curated stay for your {displayPkg.location || 'destination'} booking. The total updates instantly when you choose a hotel.
              </p>

              {hotelsLoading ? (
                <div className="hotel-loading-grid">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="hotel-loading-card">
                      <div className="hotel-loading-media" />
                      <div className="hotel-loading-line short" />
                      <div className="hotel-loading-line" />
                      <div className="hotel-loading-line tiny" />
                    </div>
                  ))}
                </div>
              ) : hotelsError ? (
                <div className="hotel-empty-state">
                  <FaHotel />
                  <h3>Hotels unavailable right now</h3>
                  <p>{hotelsError}</p>
                </div>
              ) : hotels.length === 0 ? (
                <div className="hotel-empty-state">
                  <FaHotel />
                  <h3>No hotels found for this place</h3>
                  <p>We could not find matching stays for {displayPkg.location || displayPkg.name || 'this destination'}.</p>
                </div>
              ) : (
                <div className="hotel-selection-grid">
                  {hotels.map((hotel) => (
                    <HotelChoiceCard
                      key={hotel._id || hotel.id}
                      hotel={hotel}
                      selected={String(selectedHotelId) === String(hotel._id || hotel.id)}
                      nights={hotelNights}
                      onSelect={(nextHotel) => {
                        const nextId = nextHotel._id || nextHotel.id;
                        setSelectedHotelId(String(nextId));
                        setCoupon(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="glass-panel">
              <div className="section-label">
                <div className="label-number">3</div>
                <h2>Payment Method</h2>
              </div>

              <div className="payment-grid">
                <div 
                  className={`payment-method-card ${formData.paymentMethod === 'Card' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'Card'})}
                >
                  <FaCreditCard />
                  <span>Credit Card</span>
                </div>
                <div 
                  className={`payment-method-card ${formData.paymentMethod === 'UPI' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'UPI'})}
                >
                  <FaMobileAlt />
                  <span>UPI / QR</span>
                </div>
                <div 
                  className={`payment-method-card ${formData.paymentMethod === 'Net Banking' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'Net Banking'})}
                >
                  <FaUniversity />
                  <span>Net Banking</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {formData.paymentMethod === 'Card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="card-details-form"
                  >
                    <div className="form-field mb-3">
                      <label>Card Number</label>
                      <div className="input-wrapper">
                        <FaCreditCard className="input-icon" />
                        <input type="text" placeholder="0000 0000 0000 0000" />
                      </div>
                    </div>
                    <div className="input-grid">
                      <div className="form-field">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" style={{paddingLeft: '15px'}} />
                      </div>
                      <div className="form-field">
                        <label>CVV</label>
                        <input type="password" placeholder="***" maxLength="3" style={{paddingLeft: '15px'}} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="secure-info mt-4">
                <FaLock />
                <span>Your payment information is encrypted and secure.</span>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Right Column: Order Summary */}
        <motion.div 
          className="booking-sidebar"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="summary-wrapper">
            <div className="glass-panel">
              <h3 className="summary-title">Booking Summary</h3>
              <div className="package-mini-card">
                {displayPkg.image && <img src={displayPkg.image} alt={displayPkg.name} className="mini-img" />}
                <div className="mini-info">
                  <h4>{displayPkg.name}</h4>
                  <p>{displayPkg.duration} • {displayPkg.location}</p>
                  <div className="mini-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(displayPkg.rating) ? 'star active' : 'star'}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="selected-hotel-summary">
                <div className="summary-subtitle">Selected Hotel</div>
                {selectedHotel ? (
                  <div className="selected-hotel-card">
                    <SelfHealingImage
                      src={selectedHotel.heroImage || selectedHotel.image || selectedHotel.images?.[0]}
                      alt={selectedHotel.name}
                      entityId={selectedHotel._id || selectedHotel.id}
                      type="hotel"
                      className="selected-hotel-image"
                    />
                    <div className="selected-hotel-info">
                      <h4>{selectedHotel.name}</h4>
                      <p>
                        <FaMapMarkerAlt /> {selectedHotel.location || selectedHotel.city}
                      </p>
                      <div className="selected-hotel-meta">
                        <span><FaStar /> {Number(selectedHotel.rating || 0).toFixed(1)}</span>
                        <span>{selectedHotel.roomType || selectedHotel.rooms?.[0]?.roomType || 'Standard Room'}</span>
                      </div>
                    </div>
                    <div className="selected-hotel-price">
                      <strong>Rs. {Number(selectedHotel.pricePerNight || selectedHotel.price || 0).toLocaleString()}</strong>
                      <span>/night</span>
                    </div>
                  </div>
                ) : (
                  <div className="selected-hotel-empty">
                    Choose one hotel above to include it in your booking total.
                  </div>
                )}
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Base Price (per person)</span>
                  <span>Rs. {basePrice.toLocaleString()}</span>
                </div>
                <div className="price-row">
                  <span>Travelers</span>
                  <span>x {travelers}</span>
                </div>
                <div className="price-row">
                  <span>Package Subtotal</span>
                  <span>Rs. {packageSubtotal.toLocaleString()}</span>
                </div>
                <div className="price-row">
                  <span>Hotel ({selectedHotel ? hotelNights : 0} night{hotelNights > 1 ? 's' : ''})</span>
                  <span>Rs. {hotelSubtotal.toLocaleString()}</span>
                </div>
                {coupon && (
                  <div className="price-row discount">
                    <span>Coupon ({coupon.code})</span>
                    <span>- Rs. {coupon.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="price-row total">
                  <span>Total Amount</span>
                  <span className="total-amount">Rs. {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="coupon-section">
                <div className="coupon-box">
                  <div className="input-wrapper">
                    <FaTicketAlt className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="COUPON CODE" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={coupon}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="apply-btn" 
                    onClick={handleApplyCoupon}
                    disabled={coupon || !couponCode}
                  >
                    {coupon ? 'Applied' : 'Apply'}
                  </button>
                </div>
                {coupon && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="coupon-success"
                  >
                    <HiOutlineSparkles /> Amazing! You saved ₹{coupon.discountAmount.toLocaleString()}
                  </motion.p>
                )}
              </div>

              <button 
                className="book-now-btn mt-4" 
                onClick={handleSubmit}
                disabled={submitting || !selectedHotel}
              >
                {submitting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="loading-spinner"
                    />
                    Processing...
                  </>
                ) : (
                  <>Securely Book Now <FaArrowRight /></>
                )}
              </button>
              
              <div className="trust-indicators">
                <div className="trust-item"><FaCheckCircle /> No Hidden Fees</div>
                <div className="trust-item"><FaCheckCircle /> Professional Support</div>
              </div>

              <p className="terms-text">
                By clicking "Securely Book Now", you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="success-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="success-icon">
                <FaCheckCircle />
              </div>
              <h2>Booking Confirmed!</h2>
              <p>Your adventure to <strong>{displayPkg.name}</strong> is all set. We've sent the confirmation details to <strong>{formData.email}</strong>.</p>
              
              <div className="invoice-summary mb-4">
                <div className="invoice-row">
                  <span>Invoice Number:</span>
                  <span className="invoice-val">#{bookingDetails?.invoiceNumber || 'KT-82931'}</span>
                </div>
                <div className="invoice-row">
                  <span>Total Paid:</span>
                  <span className="invoice-val">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="invoice-row">
                  <span>Travel Date:</span>
                  <span className="invoice-val">{formData.travelDate}</span>
                </div>
              </div>

              <button className="btn-home" onClick={() => navigate('/profile')}>
                View My Bookings
              </button>
              <button className="btn-secondary mt-3" onClick={() => navigate('/')}>
                Go to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Booking;
