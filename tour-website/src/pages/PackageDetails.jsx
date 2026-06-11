import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaCheck, FaTimes, FaMapMarkerAlt, FaStar, FaHeart, FaCalendarAlt, 
  FaUsers, FaClock, FaCloudSun, FaInfoCircle, FaChevronLeft, FaChevronRight,
  FaPlane, FaTrain, FaCar, FaWifi, FaCoffee, FaSpa, FaSwimmingPool,
  FaArrowRight, FaShieldAlt, FaUndo, FaQuestionCircle, FaQuoteLeft
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { api } from '../services/api';
import { DetailSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { PackageCard } from '../components/Cards';
import { HotelCard } from '../components/HotelCard';
import { detectDestinationKey, getDestinationFallbackImages } from '../utils/imageHelper';
import toast from 'react-hot-toast';
import './PackageDetails.css';

const FALLBACK_PACKAGE_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';

const HOTEL_IMAGE_POOL = [
  {
    tags: ['heritage', 'palace', 'citadel', 'royal', 'grand', 'historic'],
    url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['beach', 'coastal', 'island', 'lagoon', 'azure'],
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['forest', 'eco', 'falls', 'nature', 'retreat', 'jungle'],
    url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['mountain', 'hill', 'snow', 'alpine', 'valley'],
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['city', 'business', 'urban', 'center', 'metro'],
    url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['spa', 'wellness', 'luxury', 'resort'],
    url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['villa', 'private', 'premium', 'suite'],
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['lake', 'waterfront', 'serene'],
    url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['boutique', 'design', 'modern'],
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['room', 'comfort', 'family'],
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['pool', 'swimming', 'leisure'],
    url: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=600&q=80'
  },
  {
    tags: ['lodge', 'cabin', 'quiet'],
    url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80'
  }
];

const imageKey = (url) => String(url || '').split('?')[0];

const uniqueImages = (images = []) => {
  const seen = new Set();
  return images.filter(Boolean).filter((url) => {
    const stringUrl = String(url);
    const key = imageKey(stringUrl);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buildPackageImages = (data) => {
  const curatedFallbacks = getDestinationFallbackImages(data);
  const hasDestinationFallback = Boolean(detectDestinationKey(data?.name, data?.location, data?.category));
  const databaseImages = uniqueImages([
    data?.heroImage,
    data?.image,
    ...(data?.images || []),
    ...(data?.gallery || []),
    ...(data?.imagePool || []),
  ]);

  const orderedImages = hasDestinationFallback
    ? [...curatedFallbacks, ...databaseImages]
    : [...databaseImages, ...curatedFallbacks];

  const images = uniqueImages(orderedImages).slice(0, 12);
  return images.length > 0 ? images : [FALLBACK_PACKAGE_IMAGE];
};

const pickHotelImage = (hotelName, data, usedImages) => {
  const searchText = [
    hotelName,
    data?.name,
    data?.category,
    data?.location,
  ].filter(Boolean).join(' ').toLowerCase();

  const matchedImage = HOTEL_IMAGE_POOL.find((item) => (
    !usedImages.has(imageKey(item.url)) && item.tags.some((tag) => searchText.includes(tag))
  ));
  const fallbackImage = HOTEL_IMAGE_POOL.find((item) => !usedImages.has(imageKey(item.url)));
  const selectedImage = (matchedImage || fallbackImage || HOTEL_IMAGE_POOL[0]).url;
  usedImages.add(imageKey(selectedImage));
  return selectedImage;
};

const buildHotelCards = (hotelEntries, data, packageImages) => {
  const usedImages = new Set(packageImages.map(imageKey));
  const entries = hotelEntries?.length > 0
    ? hotelEntries
    : [
        { name: 'Azure Beach Resort', location: 'Coastal Paradise', rating: 4.9, pricePerNight: 25000, amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Restaurant'] },
        { name: 'The Grand Heritage', location: 'City Center', rating: 4.8, pricePerNight: 18000, amenities: ['Fitness Center', 'Room Service', 'Bar', 'Free Parking'] }
      ];

  return entries.map((entry, index) => {
    const hotel = typeof entry === 'string' ? { name: entry } : entry;
    const hotelName = hotel.name || hotel.title || `Luxury Stay ${index + 1}`;
    const providedImage = hotel.image || hotel.heroImage || hotel.images?.[0] || hotel.imagePool?.[0];
    const canUseProvidedImage = providedImage && !usedImages.has(imageKey(providedImage));
    const selectedImage = canUseProvidedImage ? providedImage : pickHotelImage(hotelName, data, usedImages);

    if (canUseProvidedImage) {
      usedImages.add(imageKey(selectedImage));
    }

    return {
      ...hotel,
      _id: hotel._id || `h${index}`,
      name: hotelName,
      location: hotel.location || data.location || 'City Center',
      rating: hotel.rating || 4.8,
      pricePerNight: hotel.pricePerNight || Math.round(data.price * 0.15),
      image: selectedImage,
      heroImage: selectedImage,
      images: [selectedImage],
      imagePool: [selectedImage],
      amenities: hotel.amenities?.length > 0 ? hotel.amenities : ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Restaurant']
    };
  });
};

const PackageDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [reviews, setReviews] = useState({ reviews: [], count: 0, averageRating: 0 });
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [activeItineraryDay, setActiveItineraryDay] = useState(0);
  const [travelers, setTravelers] = useState(2);
  const [date, setDate] = useState('');
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });
  const [showEnquireModal, setShowEnquireModal] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchAllData = async () => {
      try {
        setPkg(null);
        setLoading(true);
        const data = await api.getPackageById(id, { signal: abortController.signal });
        
        // Enrich data for premium feel without overwriting real content
        const enrichedPkg = {
          ...data,
          tagline: data.tagline || "Experience the ultimate luxury escape designed just for you.",
          originalPrice: data.originalPrice || Math.round(data.price * 1.25),
          discount: data.discount || "20% OFF",
          bestSeason: data.bestSeason || "October to March",
          idealFor: data.idealFor?.length > 0 ? data.idealFor : ["Luxury Travelers", "Couples", "Adventure Seekers"],
          category: data.category || "Luxury Tour",
          description: data.description || `Embark on an unforgettable journey with our ${data.name}. This meticulously crafted itinerary combines the perfect blend of relaxation, adventure, and cultural immersion.`,
          
          images: buildPackageImages(data),
          
          // Use API itinerary or fallback to a generic one only if absolutely missing
          itinerary: data.itinerary?.length > 0 ? data.itinerary : [
            { day: 1, title: "Arrival & Welcome", desc: `Arrive at the destination and transfer to your luxury resort.`, activities: ["Airport Pickup", "Check-in"] },
            { day: 2, title: "Local Sightseeing", desc: `Explore the famous landmarks and local culture.`, activities: ["City Tour", "Local Lunch"] },
            { day: 3, title: "Leisure & Departure", desc: `Enjoy a final morning of relaxation before your departure.`, activities: ["Breakfast", "Transfer"] }
          ],
          
          included: data.included?.length > 0 ? data.included : ["Luxury Accommodation", "Daily Breakfast", "Sightseeing Transfers", "Expert Guide Support"],
          excluded: data.excluded?.length > 0 ? data.excluded : ["Airfare", "Personal Expenses", "Travel Insurance"],
          
          transport: {
            icons: [<FaPlane key="p" />, <FaCar key="c" />, <FaTrain key="t" />],
            desc: data.transportDesc || "Private luxury transfers for all sightseeing and airport runs."
          },
          
          // Robust FAQ handling
          faqs: data.faqs?.length > 0 ? data.faqs : [
            { q: "What is the cancellation policy?", a: data.cancellationPolicy || "Free cancellation up to 15 days before departure." },
            { q: "Is this package customizable?", a: "Absolutely! Contact our travel experts to tailor this journey to your preferences." }
          ]
        };

        setPkg(enrichedPkg);

        // Fetch related packages
        const allPkgs = await api.getPackages();
        const packageList = Array.isArray(allPkgs) ? allPkgs : allPkgs?.data || [];
        setRelatedPackages(packageList.filter(p => p._id !== id).slice(0, 3));

        // Fetch hotels (use AI generated info if available, else mock for premium feel)
        setHotels(buildHotelCards(data.hotelsInfo, data, enrichedPkg.images));

        const reviewData = await api.getReviews('package', id);
        setReviews(reviewData);

        if (user) {
          const wishlist = await api.getWishlist();
          setWishlistSaved(wishlist.some((item) => item.itemType === 'package' && item.itemId === id));
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          console.log('Fetch aborted');
          return;
        }
        console.error('Failed to load package data:', err);
        toast.error('Could not load package details');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAllData();
    window.scrollTo(0, 0);

    return () => {
      abortController.abort();
    };
  }, [id, user]);

  const nextHeroImage = React.useCallback(() => {
    setCurrentHeroImage((prev) => (prev + 1) % pkg.images.length);
  }, [pkg?.images?.length]);

  const prevHeroImage = React.useCallback(() => {
    setCurrentHeroImage((prev) => (prev - 1 + pkg.images.length) % pkg.images.length);
  }, [pkg?.images?.length]);

  // Auto transition hero images
  useEffect(() => {
    if (!pkg) return;
    const timer = setInterval(nextHeroImage, 5000);
    return () => clearInterval(timer);
  }, [pkg, nextHeroImage]);

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save this package.');
      return;
    }
    try {
      const result = await api.toggleWishlist({
        itemType: 'package',
        itemId: id,
        title: pkg.name,
        image: pkg.image,
        price: pkg.price,
        meta: pkg.duration,
      });
      setWishlistSaved(result.saved);
      toast.success(result.saved ? 'Added to wishlist' : 'Removed from wishlist');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      toast.success('Enquiry sent successfully! We will contact you soon.');
      setShowEnquireModal(false);
      setEnquiryForm({ name: '', email: '', phone: '', message: '' });
    }, 800);
  };


  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  if (loading) return <DetailSkeleton />;

  if (!pkg) {
    return (
      <div className="error-page container">
        <FaInfoCircle size={50} />
        <h2>Package Not Found</h2>
        <Link to="/packages" className="btn btn-primary">Browse All Packages</Link>
      </div>
    );
  }

  const displayRating = reviews.averageRating || pkg.rating || 4.8;
  const displayReviewCount = reviews.count || pkg.reviews || 0;
  const packageHighlights = [
    { icon: <FaClock />, label: 'Duration', value: pkg.duration || 'Flexible stay' },
    { icon: <FaMapMarkerAlt />, label: 'Location', value: pkg.location || 'India' },
    { icon: <FaCloudSun />, label: 'Best Season', value: pkg.bestSeason || 'All year' },
    { icon: <FaUsers />, label: 'Ideal For', value: pkg.idealFor?.slice(0, 2).join(', ') || 'All travelers' },
  ];

  return (
    <div className="premium-package-page">
      {/* Progress Bar */}
      <motion.div className="scroll-progress" style={{ scaleX }} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-slider">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentHeroImage}
              className="hero-slide"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              <img
                src={pkg.images[currentHeroImage] || FALLBACK_PACKAGE_IMAGE}
                alt={pkg.name}
                className="hero-img"
                onError={(e) => { e.currentTarget.src = FALLBACK_PACKAGE_IMAGE; }}
              />
              <div className="hero-overlay"></div>
            </motion.div>
          </AnimatePresence>

          <div className="hero-content container">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="hero-breadcrumbs">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/packages">Packages</Link>
                <span>/</span>
                <span className="current">{pkg.name}</span>
              </div>
              <span className="hero-badge">{pkg.category}</span>
              <h1 className="hero-title">{pkg.name}</h1>
              <div className="hero-meta">
                <span><FaMapMarkerAlt /> {pkg.location || "India"}</span>
                <span><FaStar /> {displayRating} ({displayReviewCount} Reviews)</span>
                <span className="hero-price">Starting from ₹{pkg.price?.toLocaleString()}</span>
              </div>
              <p className="hero-tagline">{pkg.tagline}</p>
            </motion.div>
          </div>

          <button className="slider-nav prev" onClick={prevHeroImage}><FaChevronLeft /></button>
          <button className="slider-nav next" onClick={nextHeroImage}><FaChevronRight /></button>

          <div className="hero-thumbnails container">
            {pkg.images.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumb ${currentHeroImage === idx ? 'active' : ''}`}
                onClick={() => setCurrentHeroImage(idx)}
              >
                <img
                  src={img || FALLBACK_PACKAGE_IMAGE}
                  alt={`Thumb ${idx}`}
                  onError={(e) => { e.currentTarget.src = FALLBACK_PACKAGE_IMAGE; }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>



      <section className="container package-summary-strip" aria-label="Package highlights">
        {packageHighlights.map((item) => (
          <div className="summary-feature" key={item.label}>
            <span className="summary-icon">{item.icon}</span>
            <span>
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </span>
          </div>
        ))}
      </section>

      <div className="container main-layout">
        {/* Left Content Area */}
        <div className="content-area">
          
          {/* Overview Section */}
          <motion.section className="details-section" {...fadeInUp}>
            <h2 className="section-heading">Package Overview</h2>
            <p className="premium-desc">{pkg.description}</p>
          </motion.section>

          {/* Day-wise Itinerary */}
          <motion.section className="details-section" {...fadeInUp}>
            <h2 className="section-heading">Detailed Itinerary</h2>
            <div className="itinerary-accordion">
              {pkg.itinerary.map((item, idx) => (
                <div key={idx} className={`itinerary-card ${activeItineraryDay === idx ? 'active' : ''}`}>
                  <div 
                    className="itinerary-header"
                    onClick={() => setActiveItineraryDay(activeItineraryDay === idx ? -1 : idx)}
                  >
                    <div className="day-badge">Day {item.day}</div>
                    <h3 className="day-title">{item.title}</h3>
                    <div className="expand-icon">{activeItineraryDay === idx ? '-' : '+'}</div>
                  </div>
                  
                  <AnimatePresence>
                    {activeItineraryDay === idx && (
                      <motion.div 
                        className="itinerary-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <p>{item.desc}</p>
                        <ul className="activity-list">
                          {item.activities.map((act, i) => (
                            <li key={i}><FaCheck /> {act}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Inclusions & Exclusions */}
          <motion.section className="details-section" {...fadeInUp}>
            <div className="inc-exc-grid">
              <div className="inc-box">
                <h3 className="sub-heading"><FaCheck className="text-green" /> What's Included</h3>
                <ul>
                  {pkg.included.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
              <div className="exc-box">
                <h3 className="sub-heading"><FaTimes className="text-red" /> What's Excluded</h3>
                <ul>
                  {pkg.excluded.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Image Gallery */}
          <motion.section className="details-section" {...fadeInUp}>
            <h2 className="section-heading">Visual Journey</h2>
            <div className="premium-gallery">
              {pkg.images.slice(0, 5).map((img, idx) => (
                <div 
                  key={idx} 
                  className={`gallery-item item-${idx}`}
                  onClick={() => setLightbox({ open: true, index: idx })}
                >
                  <img
                    src={img || FALLBACK_PACKAGE_IMAGE}
                    alt={`Gallery ${idx}`}
                    className="zoom-on-hover"
                    onError={(e) => { e.currentTarget.src = FALLBACK_PACKAGE_IMAGE; }}
                  />
                </div>
              ))}
            </div>
          </motion.section>

          {/* Hotel Information */}
          <motion.section className="details-section" {...fadeInUp}>
            <h2 className="section-heading">Luxury Stay</h2>
            <div className="horizontal-scroll-container">
              <div className="horizontal-scroll">
                {hotels.map((hotel) => (
                  <div key={hotel._id} className="scroll-card">
                    <HotelCard {...hotel} id={hotel._id} />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Transportation */}
          <motion.section className="details-section" {...fadeInUp}>
            <h2 className="section-heading">Travel & Transport</h2>
            <div className="transport-card">
              <div className="transport-icons">
                {pkg.transport.icons}
              </div>
              <p>{pkg.transport.desc}</p>
            </div>
          </motion.section>

    

          {/* Reviews Section */}
          <motion.section className="details-section" {...fadeInUp}>
            <h2 className="section-heading">Traveler Reviews</h2>
            <div className="review-stats">
              <div className="rating-big">
                <span className="score">{displayRating}</span>
                <div className="stars">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <span className="count">Based on {displayReviewCount} reviews</span>
              </div>
              <div className="trust-badges">
                <div className="trust-item"><FaShieldAlt /> 100% Verified</div>
                <div className="trust-item"><FaUndo /> Best Price Guarantee</div>
              </div>
            </div>

            <div className="review-cards">
              {reviews.reviews.length > 0 ? (
                reviews.reviews.map((rev, idx) => (
                  <div key={idx} className="review-card">
                    <FaQuoteLeft className="quote-icon" />
                    <p className="comment">{rev.comment}</p>
                    <div className="reviewer">
                      <strong>{rev.userName}</strong>
                      <span><FaStar /> {rev.rating}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to share your experience!</p>
              )}
            </div>
          </motion.section>

          {/* FAQ Section */}
          <motion.section className="details-section" {...fadeInUp}>
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <div className="faq-list">
              {pkg.faqs.map((faq, idx) => (
                <details key={idx} className="faq-item">
                  <summary>{faq.q} <FaQuestionCircle className="faq-icon" /></summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </motion.section>

        </div>

        {/* Sidebar Booking Panel */}
        <aside className="booking-sidebar">
          <div className="sticky-booking-card">
            <div className="price-header">
              <div className="price-tags">
                <span className="discount-tag">{pkg.discount}</span>
                <span className="original-price">₹{pkg.originalPrice?.toLocaleString()}</span>
              </div>
              <div className="current-price">
                <span className="amount">₹{pkg.price?.toLocaleString()}</span>
                <span className="per-person">/ person</span>
              </div>
            </div>

            <div className="booking-controls">
              <div className="control-group">
                <label><FaCalendarAlt /> Preferred Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="booking-input"
                />
              </div>

              <div className="control-group">
                <label><FaUsers /> Travelers</label>
                <div className="traveler-selector">
                  <button onClick={() => setTravelers(Math.max(1, travelers - 1))}>-</button>
                  <span>{travelers}</span>
                  <button onClick={() => setTravelers(travelers + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="booking-summary">
              <div className="summary-row">
                <span>Base Price</span>
                <span>₹{pkg.price?.toLocaleString()} x {travelers}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>₹{(pkg.price * travelers)?.toLocaleString()}</span>
              </div>
            </div>

            <div className="action-buttons">
              <Link 
                to={`/booking/${pkg._id}`} 
                state={{ 
                  packageId: pkg._id,
                  packageName: pkg.name,
                  packageImage: pkg.image,
                  selectedDate: date,
                  travelersCount: travelers,
                  duration: pkg.duration,
                  location: pkg.location || "India",
                  basePrice: pkg.price,
                  totalAmount: pkg.price * travelers,
                  packageHotels: hotels
                }}
                className="btn-book"
              >
                Book This Tour <FaArrowRight />
              </Link>
              <button className="btn-enquiry" onClick={() => setShowEnquireModal(true)}>
                Enquire Now
              </button>
            </div>

            <button className="wishlist-toggle" onClick={handleWishlist}>
              <FaHeart className={wishlistSaved ? 'saved' : ''} /> 
              {wishlistSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>

            <div className="safety-info">
              <div className="safety-item"><FaCheck /> Instant Confirmation</div>
              <div className="safety-item"><FaCheck /> Secure Payment</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Packages */}
      <motion.section className="related-packages-section container" {...fadeInUp}>
        <div className="details-section">
          <h2 className="section-heading text-center">Similar Experiences</h2>
          <div className="related-grid">
            {relatedPackages.map((p) => (
              <PackageCard key={p._id} {...p} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {showEnquireModal && (
          <motion.div 
            className="enquire-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEnquireModal(false)}
          >
            <motion.div 
              className="enquire-modal-content details-section"
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowEnquireModal(false)}>×</button>
              <h2 className="section-heading">Enquire About {pkg.name}</h2>
              <p className="premium-desc">Fill out the form below and our travel experts will get back to you shortly.</p>
              
              <form onSubmit={handleEnquirySubmit} className="enquiry-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({...enquiryForm, name: e.target.value})}
                    placeholder="Enter your name" 
                    className="booking-input"
                  />
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({...enquiryForm, email: e.target.value})}
                      placeholder="Enter your email" 
                      className="booking-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({...enquiryForm, phone: e.target.value})}
                      placeholder="Enter your phone number" 
                      className="booking-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message / Special Requests</label>
                  <textarea 
                    rows="4" 
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({...enquiryForm, message: e.target.value})}
                    placeholder="Tell us what you are looking for..."
                    className="booking-input"
                  ></textarea>
                </div>
                <button type="submit" className="btn-book submit-enquiry">
                  Send Enquiry <FaArrowRight />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox.open && (
          <motion.div 
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox({ ...lightbox, open: false })}
          >
            <motion.div 
              className="lightbox-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={pkg.images[lightbox.index] || FALLBACK_PACKAGE_IMAGE}
                alt="Lightbox"
                onError={(e) => { e.currentTarget.src = FALLBACK_PACKAGE_IMAGE; }}
              />
              <button className="lightbox-close" onClick={() => setLightbox({ ...lightbox, open: false })}>×</button>
              <button className="lightbox-nav prev" onClick={() => setLightbox({ ...lightbox, index: (lightbox.index - 1 + pkg.images.length) % pkg.images.length })}><FaChevronLeft /></button>
              <button className="lightbox-nav next" onClick={() => setLightbox({ ...lightbox, index: (lightbox.index + 1) % pkg.images.length })}><FaChevronRight /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackageDetails;
