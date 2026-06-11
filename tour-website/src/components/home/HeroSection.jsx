import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaSearch, FaUserFriends } from 'react-icons/fa';
import SearchBar from '../common/SearchBar';

import pic1 from '../../assets/pic1.jpg';
import pic2 from '../../assets/pic2.webp';
import pic3 from '../../assets/pic3.jpg';
import pic4 from '../../assets/pic4.jpg';
import pic5 from '../../assets/pic5.webp';

const heroSlides = [
  { src: pic1, alt: 'Taj Mahal, Agra' },
  { src: pic2, alt: 'India Gate, Delhi' },
  { src: pic3, alt: 'Kerala Backwaters' },
  { src: pic4, alt: 'Goa Beach' },
  { src: pic5, alt: 'Varanasi Ghats' },
];

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const searchBarVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 },
  },
};

const quickSearchTags = ['Goa', 'Manali', 'Jaipur', 'Kerala', 'Varanasi', 'Ladakh'];

export const HeroSection = ({ destinations }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [guests, setGuests] = useState('');

  const filteredDestinations = Array.isArray(destinations)
    ? destinations
      .filter((dest) => {
        const q = searchQuery.toLowerCase();
        return (
          dest.title?.toLowerCase().includes(q)
          || dest.name?.toLowerCase().includes(q)
          || dest.location?.toLowerCase().includes(q)
        );
      })
      .slice(0, 5)
      .map((dest) => ({
        name: dest.title || dest.name,
        location: dest.location,
        type: 'destination',
        id: dest._id,
      }))
    : [];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const buildSearchUrl = (query) => {
    const params = new URLSearchParams();
    const q = (query || searchQuery).trim();
    if (q) params.set('q', q);
    if (travelDate) params.set('date', travelDate);
    if (guests) params.set('guests', guests);

    const paramString = params.toString();
    return paramString ? `/destinations?${paramString}` : '/destinations';
  };

  const handleSearchSubmit = (query) => {
    const q = query || searchQuery;
    if (!q.trim()) {
      navigate('/destinations');
      return;
    }
    navigate(buildSearchUrl(q));
  };

  const handleQuickTag = (tag) => {
    setSearchQuery(tag);
    navigate(buildSearchUrl(tag));
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="hero">
      <div className="hero-overlay" />

      {heroSlides.map((slide, index) => (
        <div
          key={slide.alt}
          className={`hero-bg-container ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.src})` }}
        />
      ))}

      <motion.div
        className="container hero-content"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div className="hero-badge" variants={fadeUpVariant}>
          Premium Travel Experience
        </motion.div>

        <motion.h1 variants={fadeUpVariant}>
          Discover Your <span className="text-gradient">Next Adventure</span>
        </motion.h1>

        <motion.p variants={fadeUpVariant}>
          Explore curated destinations, premium packages, hotels and truly unforgettable experiences
          worldwide.
        </motion.p>

        <motion.div className="hero-search-bar" variants={searchBarVariant}>
          <div className="search-field-group field-main">
            <FaSearch className="field-icon-small" />
            <div className="field-input-box">
              <label>Location</label>
              <SearchBar
                variant="hero-input"
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearchSubmit}
                suggestions={filteredDestinations}
                onSuggestionClick={(item) => {
                  setSearchQuery(item.name);
                  handleSearchSubmit(item.name);
                }}
                placeholder="Where are you going?"
              />
            </div>
          </div>

          <div className="search-field-group">
            <FaCalendarAlt className="field-icon-small" />
            <div className="field-input-box">
              <label>Date</label>
              <input
                type="date"
                value={travelDate}
                min={today}
                onChange={(event) => setTravelDate(event.target.value)}
              />
            </div>
          </div>

          <div className="search-field-group">
            <FaUserFriends className="field-icon-small" />
            <div className="field-input-box">
              <label>Guests</label>
              <input
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                placeholder="2"
              />
            </div>
          </div>

          <div className="hero-search-btn-wrapper">
            <button className="hero-search-btn-main" onClick={() => handleSearchSubmit()} type="button">
              <FaSearch /> <span>Search</span>
            </button>
          </div>
        </motion.div>

        <motion.div className="hero-quick-tags" variants={fadeUpVariant}>
          <span className="quick-label">Popular:</span>
          {quickSearchTags.map((tag) => (
            <button
              key={tag}
              className="quick-tag"
              onClick={() => handleQuickTag(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </motion.div>

        <motion.div className="hero-dots" variants={fadeUpVariant}>
          {heroSlides.map((slide, index) => (
            <span
              key={slide.alt}
              className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              role="presentation"
            >
              <span className="dot-progress" />
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
