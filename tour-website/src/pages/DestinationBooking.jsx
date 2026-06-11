import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaUsers,
  FaCommentAlt, FaCreditCard, FaMobileAlt, FaUniversity,
  FaCheckCircle, FaLock, FaArrowRight, FaTicketAlt,
  FaMapMarkerAlt, FaStar, FaClock
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import { api, axiosInstance } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { normalizeDestinationDetail } from '../utils/destinationDetails';
import toast from 'react-hot-toast';
import './Booking.css';
import './DestinationBooking.css';

const DestinationBooking = () => {
  const { id: destId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Data passed via navigate state (from DestinationDetails sidebar)
  const passedState = location.state || {};
  const restoredCheckout = passedState.destinationCheckout || {};
  const returnTo = searchParams.get('returnTo');

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(!passedState.name);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [travelers, setTravelers] = useState(restoredCheckout.travelers || passedState.travelers || 1);
  const [couponCode, setCouponCode] = useState(restoredCheckout.couponCode || '');
  const [coupon, setCoupon] = useState(null);

  const [formData, setFormData] = useState({
    fullName: restoredCheckout.formData?.fullName || '',
    email: restoredCheckout.formData?.email || '',
    phone: restoredCheckout.formData?.phone || '',
    travelDate: restoredCheckout.formData?.travelDate || passedState.travelDate || '',
    specialRequests: restoredCheckout.formData?.specialRequests || '',
    paymentMethod: restoredCheckout.formData?.paymentMethod || 'Card',
  });

  // Fetch destination details if not passed via state
  useEffect(() => {
    window.scrollTo(0, 0);
    if (passedState.name) {
      setDestination(passedState);
      return;
    }

    const fetchDest = async () => {
      const resolveFallbackQuery = () => {
        if (!returnTo) return '';

        try {
          const parsed = new URL(returnTo, window.location.origin);
          return parsed.searchParams.get('q') || parsed.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || '';
        } catch {
          try {
            const decoded = decodeURIComponent(returnTo);
            const queryFromPath = decoded.split('?')[1] || '';
            const params = new URLSearchParams(queryFromPath);
            return params.get('q') || decoded.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || '';
          } catch {
            return '';
          }
        }
      };

      try {
        const data = await api.getDestinationById(destId);
        setDestination(
          normalizeDestinationDetail(data || {}, {
            detailPath: returnTo || `/destination/${destId}`,
            source: 'database',
            fallbackName: data?.name || data?.title || destId,
          })
        );
      } catch (err) {
        console.warn('Primary booking destination lookup failed:', err);

        const fallbackQuery = resolveFallbackQuery();
        if (fallbackQuery) {
          try {
            const searchData = await api.searchPlace(fallbackQuery);
            setDestination(
              normalizeDestinationDetail(searchData || {}, {
                detailPath: returnTo || `/destination/${destId}`,
                source: 'dynamic',
                fallbackName: fallbackQuery,
              })
            );
            return;
          } catch (searchErr) {
            console.warn('Search fallback failed, trying AI destination lookup:', searchErr);
          }

          try {
            const generated = await api.aiSearchDestination(fallbackQuery);
            const generatedData = generated?.data || generated;
            setDestination(
              normalizeDestinationDetail(generatedData || {}, {
                detailPath: returnTo || `/destination/${destId}`,
                source: 'dynamic',
                fallbackName: fallbackQuery,
              })
            );
            return;
          } catch (aiErr) {
            console.error(aiErr);
          }
        }

        toast.error('Failed to load destination details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destId, passedState.name, returnTo]);

  // Auto-fill user info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const displayDest = {
    ...passedState,
    ...(destination || {}),
    name: destination?.name || passedState.name,
    heroImage: destination?.heroImage || passedState.heroImage || destination?.images?.[0] || passedState.images?.[0],
    images: destination?.images || passedState.images || [],
    location: destination?.location || passedState.location,
    price: destination?.price ?? passedState.price,
    rating: destination?.rating || passedState.rating || 4.5,
    duration: destination?.duration || passedState.duration,
    type: destination?.type || destination?.category || passedState.type || passedState.category,
    category: destination?.category || passedState.category || passedState.type,
    detailPath: destination?.detailPath || passedState.detailPath,
    bookingKey: destination?.bookingKey || passedState.bookingKey || destId,
    isDynamic: destination?.isDynamic ?? passedState.isDynamic ?? false,
  };

  const basePrice = Number(displayDest?.price ?? 0);
  const subtotal = basePrice * travelers;
  const totalPrice = coupon ? coupon.finalAmount : subtotal;
  const bookingBackPath = (() => {
    if (destination?.detailPath) {
      return destination.detailPath;
    }

    if (returnTo) {
      try {
        return decodeURIComponent(returnTo);
      } catch {
        return returnTo;
      }
    }

    if (passedState.detailPath) {
      return passedState.detailPath;
    }

    return `/destination/${destId}`;
  })();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTravelers = (type) => {
    if (type === 'inc') setTravelers(prev => prev + 1);
    else if (type === 'dec' && travelers > 1) setTravelers(prev => prev - 1);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Please enter a coupon code'); return; }
    try {
      const data = await api.validateCoupon(couponCode, subtotal);
      setCoupon(data);
      toast.success(`Coupon applied! Saved ₹${data.discountAmount}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code');
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!user) {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            state: {
              ...passedState,
              destinationCheckout: {
                formData,
                travelers,
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

    setSubmitting(true);
    try {
      // Destination bookings reuse the same /api/bookings endpoint
      // packageId is left out (optional in schema), destinationName stored as packageName
      const { data } = await axiosInstance.post('/bookings', {
        ...formData,
        travelers,
        totalPrice: totalPrice,
        couponCode: coupon?.code || '',
        packageName: displayDest.name, // stored for audit logs & email
        destinationId: destination?.isDynamic ? null : destId,
        destinationKey: destination?.bookingKey || destId,
        destinationPath: destination?.detailPath || bookingBackPath,
        destinationSource: destination?.source || 'destination',
      });

      const saved = data.data !== undefined ? data.data : data;
      setBookingDetails(saved);
      setShowSuccess(true);
      toast.success('Booking Confirmed! 🎉');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Booking failed. Please try again.';
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dest-booking-loading">
        <div className="dest-booking-spinner" />
        <p>Loading destination details...</p>
      </div>
    );
  }

  if (!displayDest?.name) {
    return (
      <div className="dest-booking-loading">
        <div className="dest-booking-spinner" />
        <p>Destination details could not be loaded.</p>
        <Link
          to="/destinations"
          className="mt-4 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Back to Destinations
        </Link>
      </div>
    );
  }

  const heroImage = displayDest?.heroImage || displayDest?.images?.[0] || displayDest?.image;

  return (
    <div className="booking-page dest-booking-page">
      {/* Hero Header */}
      <section className="booking-header-section">
        {heroImage && (
          <img src={heroImage} alt={displayDest?.name} className="header-bg-image" />
        )}
        <div className="header-overlay" />
        <div className="header-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="dest-booking-badge">Destination Booking</span>
            <h1>Book Your Trip</h1>
            <div className="breadcrumb">
              <Link to="/">Home</Link> •{' '}
              <Link to="/destinations">Destinations</Link> •{' '}
              <Link to={bookingBackPath}>{displayDest?.name}</Link> •{' '}
              <span className="active">Book Now</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="booking-container">
        {/* Left: Form */}
        <motion.div
          className="booking-main"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Step nav */}
          <div className="booking-steps-nav mb-4">
            <div className="step-indicator active"><span>1</span> Details</div>
            <div className="step-line" />
            <div className="step-indicator"><span>2</span> Payment</div>
            <div className="step-line" />
            <div className="step-indicator"><span>3</span> Confirm</div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Traveler Details */}
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
                      type="text" name="fullName" required
                      placeholder="e.g. Arjun Sharma"
                      value={formData.fullName} onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email" name="email" required
                      placeholder="arjun@example.com"
                      value={formData.email} onChange={handleChange}
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
                      type="tel" name="phone" required
                      placeholder="+91 98765 43210"
                      value={formData.phone} onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>Travel Date</label>
                  <div className="input-wrapper">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      type="date" name="travelDate" required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.travelDate} onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-field mb-4">
                <label>Number of Travelers</label>
                <div className="travelers-selector">
                  <button type="button" className="counter-btn" onClick={() => handleTravelers('dec')} disabled={travelers <= 1}>−</button>
                  <span className="traveler-count">{travelers}</span>
                  <button type="button" className="counter-btn" onClick={() => handleTravelers('inc')}>+</button>
                  <span className="traveler-label"><FaUsers /> {travelers > 1 ? 'Travelers' : 'Traveler'}</span>
                </div>
              </div>

              <div className="form-field">
                <label>Special Requests (Optional)</label>
                <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
                  <FaCommentAlt className="input-icon" style={{ marginTop: '15px' }} />
                  <textarea
                    name="specialRequests" rows="3"
                    placeholder="Vegetarian meals, wheelchair access, honeymoon setup..."
                    value={formData.specialRequests} onChange={handleChange}
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass-panel">
              <div className="section-label">
                <div className="label-number">2</div>
                <h2>Payment Method</h2>
              </div>

              <div className="payment-grid">
                {[
                  { id: 'Card', icon: <FaCreditCard />, label: 'Credit Card' },
                  { id: 'UPI', icon: <FaMobileAlt />, label: 'UPI / QR' },
                  { id: 'Net Banking', icon: <FaUniversity />, label: 'Net Banking' },
                ].map(method => (
                  <div
                    key={method.id}
                    className={`payment-method-card ${formData.paymentMethod === method.id ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                  >
                    {method.icon}
                    <span>{method.label}</span>
                  </div>
                ))}
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
                        <input type="text" placeholder="MM/YY" style={{ paddingLeft: '15px' }} />
                      </div>
                      <div className="form-field">
                        <label>CVV</label>
                        <input type="password" placeholder="***" maxLength="3" style={{ paddingLeft: '15px' }} />
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

        {/* Right: Order Summary */}
        <motion.div
          className="booking-sidebar"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="summary-wrapper">
            <div className="glass-panel">
              <h3 className="summary-title">Trip Summary</h3>

              {/* Destination mini card */}
              <div className="dest-booking-mini-card">
                {heroImage && (
                  <img src={heroImage} alt={displayDest?.name} className="dest-mini-img" />
                )}
                <div className="dest-mini-info">
                  <span className="dest-mini-badge">{displayDest?.type}</span>
                  <h4>{displayDest?.name}</h4>
                  <p className="dest-mini-location">
                    <FaMapMarkerAlt /> {displayDest?.location}
                  </p>
                  {displayDest?.duration && (
                    <p className="dest-mini-duration">
                      <FaClock /> {displayDest.duration}
                    </p>
                  )}
                  <div className="dest-mini-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < Math.floor(displayDest?.rating || 4) ? 'star-active' : 'star-dim'}
                      />
                    ))}
                    <span>{displayDest?.rating}</span>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Base Price (per person)</span>
                  <span>₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="price-row">
                  <span>Travelers</span>
                  <span>× {travelers}</span>
                </div>
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {coupon && (
                  <div className="price-row" style={{ color: '#10b981' }}>
                    <span>Coupon ({coupon.code})</span>
                    <span>− ₹{coupon.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="price-row total">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="coupon-section">
                <div className="coupon-box">
                  <div className="input-wrapper">
                    <FaTicketAlt className="input-icon" />
                    <input
                      type="text"
                      placeholder="COUPON CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!coupon}
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="apply-btn"
                    onClick={handleApplyCoupon}
                    disabled={!!coupon || !couponCode}
                  >
                    {coupon ? 'Applied ✓' : 'Apply'}
                  </button>
                </div>
                {coupon && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="coupon-success"
                  >
                    <HiOutlineSparkles /> Amazing! You saved ₹{coupon.discountAmount.toLocaleString('en-IN')}
                  </motion.p>
                )}
              </div>

              {/* Submit */}
              <button
                className="book-now-btn mt-4"
                onClick={handleSubmit}
                disabled={submitting}
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
                  <>Confirm &amp; Book Now <FaArrowRight /></>
                )}
              </button>

              <div className="trust-indicators">
                <div className="trust-item"><FaCheckCircle /> Free Cancellation</div>
                <div className="trust-item"><FaCheckCircle /> Secure Payment</div>
                <div className="trust-item"><FaCheckCircle /> 24/7 Support</div>
              </div>

              <p className="terms-text">
                By booking, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
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
              <motion.div
                className="success-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <FaCheckCircle />
              </motion.div>

              <h2>Booking Confirmed! 🎉</h2>
              <p>
                Your trip to <strong>{displayDest?.name}</strong> is all set!
                Confirmation details sent to <strong>{formData.email}</strong>.
              </p>

              <div className="invoice-summary mb-4">
                <div className="invoice-row">
                  <span>Invoice:</span>
                  <span className="invoice-val">#{bookingDetails?.invoiceNumber || 'KT-PENDING'}</span>
                </div>
                <div className="invoice-row">
                  <span>Destination:</span>
                  <span className="invoice-val">{displayDest?.name}</span>
                </div>
                <div className="invoice-row">
                  <span>Travelers:</span>
                  <span className="invoice-val">{travelers} {travelers > 1 ? 'persons' : 'person'}</span>
                </div>
                <div className="invoice-row">
                  <span>Travel Date:</span>
                  <span className="invoice-val">{formData.travelDate}</span>
                </div>
                <div className="invoice-row">
                  <span>Total Paid:</span>
                  <span className="invoice-val" style={{ color: '#10b981', fontWeight: 700 }}>
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button className="btn-home" onClick={() => navigate('/profile')}>
                View My Bookings
              </button>
              <button className="btn-secondary mt-3" onClick={() => navigate('/destinations')}>
                Explore More Destinations
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationBooking;
