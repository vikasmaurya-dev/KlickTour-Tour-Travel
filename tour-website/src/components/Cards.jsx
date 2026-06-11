import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaArrowRight, FaHeart, FaExchangeAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import CardImageGallery from './common/CardImageGallery';
import './Cards.css';

export const DestinationCard = ({ _id, id, image, heroImage, images, imagePool, name, type, location, description, price, rating, packageId, onClick }) => {
  const cardId = _id || id || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : undefined);
  const initialImage = heroImage || images?.[0] || image;
  const displayRating = rating || (4 + ((price || 0) % 10) / 10).toFixed(1);

  const handleExplore = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <motion.div 
      className="inspo-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.4 }}
    >
      <div className="inspo-card-img-wrapper">
        <CardImageGallery 
          mainImage={initialImage}
          gallery={images}
          imagePool={imagePool}
          alt={name}
          entityId={cardId}
          type="destination"
          onClick={handleExplore}
        />
        
        {type && <span className="inspo-badge-category">{type}</span>}

        <span className="inspo-badge-rating">
          <FaStar className="inspo-star" /> {displayRating}
        </span>
      </div>
      <div className="inspo-card-body">
        <div className="inspo-card-header">
          <h3 className="inspo-card-title">{name}</h3>
          <p className="inspo-card-location">
            <FaMapMarkerAlt className="inspo-pin" /> {location || 'India'}
          </p>
        </div>
        <p className="inspo-card-desc">{description}</p>
        <div className="inspo-card-divider"></div>
        <div className="inspo-card-meta">
          <div className="inspo-meta-item">
            <span className="inspo-meta-label">Starting from</span>
            <span className="inspo-meta-price">₹{price?.toLocaleString('en-IN')}</span>
          </div>
          {onClick ? (
            <button onClick={onClick} className="inspo-explore-btn" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              Explore <FaArrowRight />
            </button>
          ) : (
          <Link 
            to={cardId ? `/destination/${cardId}` : '/destinations'} 
            className="inspo-explore-btn"
          >
            Explore <FaArrowRight />
          </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const PackageCard = ({ _id, id, image, heroImage, gallery, imagePool, name, duration, price, rating, badge, comfortLevel, isEcoFriendly, location, viewType = 'grid' }) => {
  const cardId = _id || id;
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [isCompared, setIsCompared] = React.useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const toggleCompare = (e) => {
    e.stopPropagation();
    setIsCompared(!isCompared);
  };

  return (
    <motion.div 
      className={`inspo-card ${viewType === 'list' ? 'list-view' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="inspo-card-img-wrapper">
        <CardImageGallery 
          mainImage={heroImage || image || gallery?.[0]}
          gallery={gallery}
          imagePool={imagePool}
          alt={name}
          entityId={cardId}
          type="package"
        />
        
        {/* Overlays */}
        <div className="pkg-badges-top">
          {badge && <span className="inspo-badge-custom">{badge}</span>}
          {isEcoFriendly && <span className="inspo-badge-eco" title="Eco-Friendly Tour">🍃 Eco</span>}
          {!badge && !isEcoFriendly && <span className="inspo-badge-category">Tour Package</span>}
        </div>
        
        <span className="inspo-badge-rating"><FaStar className="inspo-star" /> {rating || 4.5}</span>
        
        {/* Wishlist Button */}
        <motion.button 
          className={`pkg-wishlist-btn ${isWishlisted ? 'active' : ''}`} 
          onClick={toggleWishlist}
          title="Add to Wishlist"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
        >
          <motion.div
            animate={{ 
              scale: isWishlisted ? [1, 1.4, 1] : 1,
              color: isWishlisted ? "#ff4757" : "rgba(255, 255, 255, 0.8)"
            }}
            transition={{ duration: 0.3 }}
          >
            <FaHeart />
          </motion.div>
        </motion.button>

        {/* Compare Checkbox */}
        <motion.label 
          className="pkg-compare-checkbox" 
          title="Add to Compare" 
          onClick={(e) => e.stopPropagation()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <input type="checkbox" checked={isCompared} onChange={toggleCompare} />
          <motion.span 
            className="compare-icon"
            animate={{ 
              backgroundColor: isCompared ? "var(--primary)" : "rgba(0, 0, 0, 0.3)",
              color: isCompared ? "#fff" : "rgba(255, 255, 255, 0.9)"
            }}
          >
            <FaExchangeAlt />
          </motion.span>
        </motion.label>
      </div>
      <div className="inspo-card-body">
        <div className="pkg-card-main-info">
          <h3 className="inspo-card-title">{name}</h3>
          <p className="inspo-card-location">
            <FaMapMarkerAlt className="inspo-pin" /> {location || 'India'}
            {comfortLevel && <span className="pkg-comfort-tag"> • {comfortLevel}</span>}
          </p>
          <p className="inspo-card-desc">Experience this carefully curated tour package with top-rated accommodations and unforgettable moments.</p>
        </div>
        
        {viewType === 'list' && (
          <div className="pkg-card-features-list">
            <span>✅ Top-rated Hotels</span>
            <span>✅ Expert Guides</span>
            <span>✅ Flexible Dates</span>
          </div>
        )}

        <div className="inspo-card-divider"></div>
        <div className="inspo-card-meta">
          <div className="inspo-meta-group">
            <div className="inspo-meta-item">
              <span className="inspo-meta-label">Duration</span>
              <span className="inspo-meta-value">{duration}</span>
            </div>
            <div className="inspo-meta-item inspo-meta-right">
              <span className="inspo-meta-label">Starting from</span>
              <span className="inspo-meta-price">₹{price?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Link to={`/packages/${cardId}`} className="inspo-explore-btn">
            View Details <FaArrowRight />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
