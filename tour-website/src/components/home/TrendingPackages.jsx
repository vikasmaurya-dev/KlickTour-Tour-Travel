import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { PackageCard } from '../Cards';
import { CardSkeleton } from '../Skeleton';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const TrendingPackages = ({ packages, loading }) => {
  const packageScrollRef = useRef(null);

  const scrollContainer = (direction) => {
    if (packageScrollRef.current) {
      const scrollAmount = packageScrollRef.current.clientWidth > 768 ? 660 : 330;
      packageScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="section trending-packages">
      <motion.div 
        className="container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
      >
        <div className="section-header">
          <h2 className="section-title">Trending Packages</h2>
          <p className="section-subtitle">Handpicked experiences for your next unforgettable journey</p>
        </div>

        {loading ? (
          <div className="horizontal-scroll" style={{ overflow: 'hidden' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'inline-block', marginRight: '20px' }}>
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="carousel-wrapper">
            <button className="scroll-arrow left" onClick={() => scrollContainer('left')}>
              <FaChevronLeft />
            </button>
            <div className="horizontal-scroll" ref={packageScrollRef}>
              {packages && packages.length > 0 ? (
                packages.map(pkg => (
                  <div key={pkg._id} style={{ display: 'inline-block', minWidth: '320px' }}>
                    <PackageCard {...pkg} />
                  </div>
                ))
              ) : (
                <p className="no-data">No packages available at the moment.</p>
              )}
            </div>
            <button className="scroll-arrow right" onClick={() => scrollContainer('right')}>
              <FaChevronRight />
            </button>
          </div>
        )}

        <div className="section-footer section-footer-centered">
          <Link to="/packages" className="btn btn-outline premium-btn">
            View All Packages
            <span className="btn-glow"></span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};
