import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaCloudSun,
  FaClock,
  FaMapMarkerAlt,
  FaImage,
  FaRupeeSign,
  FaStar,
  FaUsers,
  FaBoxOpen,
  FaHotel,
  FaWalking,
  FaMapMarkedAlt,
  FaCar,
  FaTrain,
  FaPlane,
  FaBus,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { PackageCard } from '../Cards';
import { signatureModes } from '../transportation/transportData';
import {
  buildDestinationBookingState,
  formatDestinationCurrency,
  normalizeDestinationDetail,
  slugify,
} from '../../utils/destinationDetails';
import '../../styles/DestinationDetailsTemplate.css';

const heroVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const modeIconMap = {
  road: FaCar,
  rail: FaTrain,
  flight: FaPlane,
  coach: FaBus,
};

const modeAccentMap = {
  road: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  rail: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  flight: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  coach: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
};

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((item) => toArray(item));
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const uniqueStrings = (values = []) => {
  const seen = new Set();
  return values.filter((value) => {
    if (!value) return false;
    const next = String(value).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

const infoIconFor = (label, hasIdealFor) => {
  const normalized = label.toLowerCase();
  if (normalized.includes('duration')) return <FaClock />;
  if (normalized.includes('weather') || normalized.includes('season')) return <FaCloudSun />;
  if (normalized.includes('ideal')) return <FaUsers />;
  return hasIdealFor ? <FaUsers /> : <FaMapMarkerAlt />;
};

const ModeIconCard = ({ mode, index }) => {
  const Icon = modeIconMap[mode.icon] || FaCar;
  const accent = modeAccentMap[mode.icon] || 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)';

  return (
    <motion.div
      className="destination-mode-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
    >
      <div className="destination-mode-card-icon-wrap" style={{ background: accent }}>
        <motion.span
          className="destination-mode-card-orbit destination-mode-card-orbit-left"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="destination-mode-card-orbit destination-mode-card-orbit-right"
          animate={{ rotate: -360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="destination-mode-card-icon-shell"
          animate={{ y: [0, -5, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="destination-mode-card-icon" />
        </motion.div>
      </div>
      <div className="destination-mode-card-body">
        <span className="destination-mode-card-badge">{mode.badge}</span>
        <h3>{mode.title}</h3>
        <p>{mode.desc}</p>
      </div>
    </motion.div>
  );
};

const DestinationDetailsTemplate = ({ destination: rawDestination, backLink = '/destinations' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const destination = useMemo(
    () =>
      normalizeDestinationDetail(rawDestination, {
        detailPath: `${location.pathname}${location.search}`,
        source: rawDestination?.isDynamic ? 'dynamic' : 'database',
      }),
    [rawDestination, location.pathname, location.search]
  );

  const raw = destination.raw || rawDestination || {};
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(2);

  const relatedPackages = useMemo(() => {
    const list = Array.isArray(raw.packages) ? raw.packages : [];
    const resolvedPackages = list.slice(0, 4).map((pkg, index) => ({
      ...pkg,
      id: pkg._id || pkg.id || slugify(pkg.name || pkg.title || `package-${index}`),
      gallery: pkg.gallery || (pkg.image ? [pkg.image] : []),
      name: pkg.name || pkg.title || `Package ${index + 1}`,
      duration: pkg.duration || pkg.tripDuration || 'Flexible',
      badge: pkg.badge || pkg.category || 'Tour Package',
    }));

    if (resolvedPackages.length > 0) {
      return resolvedPackages;
    }

    const fallbackImages = destination.gallery.length > 0
      ? destination.gallery
      : destination.imagePool.length > 0
        ? destination.imagePool
        : [destination.heroImage];

    return [
      {
        id: slugify(`${destination.name}-escape`),
        image: fallbackImages[0],
        gallery: fallbackImages,
        name: `${destination.name} Escape`,
        duration: destination.duration,
        price: destination.price || 0,
        rating: destination.rating,
        badge: destination.category || 'Tour Package',
        location: destination.location,
      },
      {
        id: slugify(`${destination.name}-premium-stay`),
        image: fallbackImages[1] || fallbackImages[0],
        gallery: fallbackImages,
        name: `${destination.name} Premium Stay`,
        duration: destination.duration,
        price: Math.max(destination.price || 0, 1) + 4500,
        rating: Math.max(destination.rating - 0.1, 4.3),
        badge: 'Curated',
        location: destination.location,
      },
    ];
  }, [raw]);

  const relatedHotels = useMemo(() => {
    const list = Array.isArray(raw.hotels) ? raw.hotels : [];
    const resolvedHotels = list.slice(0, 3).map((hotel, index) => ({
      ...hotel,
      _id: hotel._id || hotel.id || slugify(hotel.name || hotel.title || `hotel-${index}`),
      image: hotel.image || hotel.images?.[0] || hotel.heroImage,
      name: hotel.name || hotel.title || `Hotel ${index + 1}`,
      city: hotel.city || hotel.location || destination.location,
      price: hotel.price || hotel.startingPrice || hotel.cost || 0,
      rating: hotel.rating || 4.5,
    }));

    if (resolvedHotels.length > 0) {
      return resolvedHotels;
    }

    const fallbackImages = destination.gallery.length > 0
      ? destination.gallery
      : destination.imagePool.length > 0
        ? destination.imagePool
        : [destination.heroImage];

    return [
      {
        _id: slugify(`${destination.name}-stay-1`),
        image: fallbackImages[0],
        name: `${destination.name} Resort`,
        city: destination.location,
        price: Math.max(destination.price || 0, 1) + 6000,
        rating: 4.7,
      },
      {
        _id: slugify(`${destination.name}-stay-2`),
        image: fallbackImages[1] || fallbackImages[0],
        name: `${destination.name} Boutique Stay`,
        city: destination.location,
        price: Math.max(destination.price || 0, 1) + 3500,
        rating: 4.5,
      },
    ];
  }, [raw, destination.location]);

  const thingsToDo = useMemo(() => {
    const fromData = uniqueStrings([
      ...toArray(raw.thingsToDo),
      ...toArray(raw.activities),
      ...toArray(raw.tags),
    ]);

    if (fromData.length > 0) return fromData.slice(0, 6);

    const place = destination.name || destination.location || 'this destination';
    return [
      `Explore ${place}`,
      'Sightseeing',
      'Shopping',
      'Cultural Tours',
      'Local Dining',
    ];
  }, [raw, destination.name, destination.location]);

  const attractions = useMemo(() => {
    const fromData = uniqueStrings([
      ...toArray(raw.famousAttractions),
      ...toArray(raw.attractions),
      ...toArray(raw.highlights),
    ]);

    if (fromData.length > 0) return fromData.slice(0, 5);

    const place = destination.location || destination.name || 'the destination';
    return [
      `City center of ${place}`,
      'Historic landmarks',
      'Local markets',
    ];
  }, [raw, destination.location, destination.name]);

  const infoCards = useMemo(() => {
    const cards = [
      { label: 'Best Time', value: destination.bestTime, icon: <FaCalendarAlt /> },
      { label: 'Duration', value: destination.duration, icon: <FaClock /> },
      { label: 'Weather', value: destination.weather, icon: <FaCloudSun /> },
      {
        label: destination.idealFor.length > 0 ? 'Ideal For' : 'Location',
        value: destination.idealFor.length > 0 ? destination.idealFor.join(', ') : destination.location,
        icon: infoIconFor(destination.idealFor.length > 0 ? 'Ideal For' : 'Location', destination.idealFor.length > 0),
      },
    ];

    return cards.filter((card) => Boolean(card.value));
  }, [destination]);

  const totalAmount = (destination.price || 0) * travelers;

  const chipRating = destination.reviewCount > 0
    ? `${destination.rating.toFixed(1)} (${destination.reviewCount} Reviews)`
    : `${destination.rating.toFixed(1)} / 5`;

  const handleBook = (e) => {
    e.preventDefault();

    if (!travelDate) {
      toast.error('Please select a travel date first');
      return;
    }

    navigate(destination.bookingPath, {
      state: buildDestinationBookingState(destination, {
        travelDate,
        travelers,
      }),
    });
  };

  const heroTagline = destination.tagline || 'Experience the journey of a lifetime';

  return (
    <div className="destination-detail-page">
      <motion.section
        className="destination-detail-hero"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <div
          className="destination-detail-hero-bg"
          style={{ backgroundImage: `url(${destination.heroImage})` }}
        />
        <div className="destination-detail-hero-overlay" />

        <div className="destination-detail-hero-content container">
          <motion.div className="destination-detail-breadcrumb" variants={heroVariants}>
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to={backLink}>Destinations</Link>
            <span>/</span>
            <span>{destination.name}</span>
          </motion.div>

          <motion.span className="destination-detail-eyebrow" variants={heroVariants}>
            {heroTagline}
          </motion.span>

          <motion.h1 className="destination-detail-title" variants={heroVariants}>
            {destination.name}
          </motion.h1>

          <motion.div className="destination-detail-chip-row" variants={heroVariants}>
            <div className="destination-detail-chip">
              <FaMapMarkerAlt />
              <span>{destination.location}</span>
            </div>
            <div className="destination-detail-chip">
              <FaStar />
              <span>{chipRating}</span>
            </div>
            <div className="destination-detail-chip destination-detail-chip--price">
              <FaRupeeSign />
              <span>Starting from {formatDestinationCurrency(destination.price)}</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="destination-detail-shell container">
        <div className="destination-detail-layout">
          <div className="destination-detail-main">
            <motion.section
              className="destination-detail-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <div className="destination-detail-card-title">
                <span className="destination-detail-card-icon"><FaMapMarkerAlt /></span>
                <div>
                  <h2>Overview</h2>
                  <p>Quick snapshot of what makes this destination special.</p>
                </div>
              </div>
              <p className="destination-detail-overview">
                {destination.description || 'Destination details will be available soon.'}
              </p>

              <div className="destination-detail-info-grid destination-detail-info-grid--inside">
                {infoCards.map((card) => (
                  <div key={card.label} className="destination-info-card">
                    <div className="destination-info-card-icon">{card.icon}</div>
                    <div className="destination-info-card-body">
                      <span>{card.label}</span>
                      <strong>{card.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              className="destination-detail-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <div className="destination-detail-card-title">
                <span className="destination-detail-card-icon"><FaImage /></span>
                <div>
                  <h2>Gallery</h2>
                  <p>Curated destination visuals in the same premium layout.</p>
                </div>
              </div>
              <div className="destination-detail-gallery">
                {destination.gallery.slice(0, 3).map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className={`destination-gallery-item destination-gallery-item--${idx}`}
                    style={{ backgroundImage: `url(${img})` }}
                  />
                ))}
              </div>
            </motion.section>

            <motion.section
                className="destination-detail-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <div className="destination-detail-section-header">
                  <div className="destination-detail-section-title">
                    <span className="destination-detail-section-icon"><FaBoxOpen /></span>
                    <div>
                      <h2>Tour Packages</h2>
                      <p>Handpicked stays and experiences around this destination.</p>
                    </div>
                  </div>
                  <Link to="/packages" className="destination-detail-section-link">View All</Link>
                </div>

                <div className="destination-detail-package-grid">
                  {relatedPackages.map((pkg) => (
                    <PackageCard key={pkg.id} {...pkg} />
                  ))}
                </div>
              </motion.section>
            <motion.section
                className="destination-detail-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
              >
                <div className="destination-detail-section-header">
                  <div className="destination-detail-section-title">
                    <span className="destination-detail-section-icon"><FaHotel /></span>
                    <div>
                      <h2>Places to Stay</h2>
                      <p>Comfortable accommodation picks with strong local appeal.</p>
                    </div>
                  </div>
                  <Link to="/hotels" className="destination-detail-section-link">View All</Link>
                </div>

                <div className="destination-detail-hotel-grid">
                  {relatedHotels.map((hotel, index) => (
                    <div key={hotel._id || index} className="destination-hotel-card">
                      <img
                        src={hotel.image || destination.imagePool[index + 1] || destination.heroImage}
                        alt={hotel.name}
                        className="destination-hotel-card-image"
                      />
                      <div className="destination-hotel-card-body">
                        <h3>{hotel.name}</h3>
                        <p className="destination-hotel-card-location">
                          <FaMapMarkerAlt /> {hotel.city || destination.location}
                        </p>
                        <div className="destination-hotel-card-footer">
                          <span>₹{Number(hotel.price || 0).toLocaleString('en-IN')} / night</span>
                          <Link to={hotel._id ? `/hotels/${hotel._id}` : '/hotels'}>Book Room</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

            <motion.section
              className="destination-detail-section"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <div className="destination-detail-section-header">
                <div className="destination-detail-section-title">
                  <span className="destination-detail-section-icon"><FaMapMarkedAlt /></span>
                  <div>
                    <h2>Location Map</h2>
                    <p>Find the destination on the map.</p>
                  </div>
                </div>
              </div>

              <iframe
                className="destination-map-frame"
                src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(destination.name)}`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${destination.name} map`}
              />
            </motion.section>

            <motion.section
              className="destination-detail-section"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
            >
              <div className="destination-detail-section-header">
                <div className="destination-detail-section-title">
                  <span className="destination-detail-section-icon"><FaMapMarkerAlt /></span>
                  <div>
                    <h2>Getting There</h2>
                    <p>Choose the travel mode that fits your trip best.</p>
                  </div>
                </div>
              </div>

              <div className="destination-mode-grid">
                {signatureModes.map((mode, index) => (
                  <ModeIconCard key={mode.title} mode={mode} index={index} />
                ))}
              </div>
            </motion.section>
          </div>

          <aside className="destination-detail-sidebar">
            <motion.div
              className="destination-booking-card"
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="destination-booking-hero">
                <img src={destination.heroImage} alt={destination.name} />
                <span className="destination-booking-badge">{destination.category}</span>
              </div>

              <div className="destination-booking-body">
                <div className="destination-booking-price-row">
                  <div>
                    <span className="destination-booking-label">Price per person</span>
                    <strong className="destination-booking-price">
                      {formatDestinationCurrency(destination.price)}
                    </strong>
                  </div>
                  <span className="destination-booking-offer">Best Offer</span>
                </div>

                <form className="destination-booking-form" onSubmit={handleBook}>
                  <div className="destination-booking-field">
                    <label htmlFor="destination-travel-date">
                      <FaCalendarAlt /> Travel Date
                    </label>
                    <input
                      id="destination-travel-date"
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="destination-booking-field">
                    <label>
                      <FaUsers /> Number of Travelers
                    </label>
                    <div className="destination-travelers-stepper">
                      <button
                        type="button"
                        onClick={() => setTravelers((value) => Math.max(1, value - 1))}
                      >
                        -
                      </button>
                      <span>{travelers}</span>
                      <button
                        type="button"
                        onClick={() => setTravelers((value) => value + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="destination-booking-total">
                    <span>Total Amount</span>
                    <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
                  </div>

                  <button type="submit" className="destination-booking-btn">
                    Confirm &amp; Book Now
                  </button>
                </form>

                <p className="destination-booking-note">Free cancellation | Secure Payment</p>
              </div>
            </motion.div>

            <motion.div
              className="destination-sidebar-info-card"
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <div className="destination-sidebar-card-title">
                <span className="destination-detail-section-icon"><FaWalking /></span>
                <div>
                  <h2>Things To Do</h2>
                  <p>Recommended experiences that fit the destination vibe.</p>
                </div>
              </div>

              <div className="destination-sidebar-things">
                {thingsToDo.map((item) => (
                  <span key={item} className="destination-thing-pill">{item}</span>
                ))}
              </div>

              <div className="destination-attractions-block">
                <h4>Top Attractions</h4>
                <ul className="destination-attractions-list">
                  {attractions.map((attr) => (
                    <li key={attr}>{attr}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetailsTemplate;
