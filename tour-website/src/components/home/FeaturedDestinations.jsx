import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { DestinationCard } from '../Cards';
import { CardSkeleton } from '../Skeleton';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const FeaturedDestinations = ({ destinations = [], loading }) => {
  const destScrollRef = useRef(null);

  const scrollContainer = (direction) => {
    if (destScrollRef.current) {
      const scrollAmount = destScrollRef.current.clientWidth > 768 ? 660 : 330;
      destScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="section section-muted featured-destinations">
      <motion.div 
        className="container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
      >
        <div className="section-header">
          <h2 className="section-title">Featured Destinations</h2>
          <p className="section-subtitle">Handpicked places for your next adventure</p>
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
            <button className="scroll-arrow left" onClick={() => scrollContainer('left')} aria-label="Scroll left">
              <FaChevronLeft />
            </button>
            <div className="horizontal-scroll" ref={destScrollRef}>
              {Array.isArray(destinations) && destinations.length > 0 ? (
                destinations.slice(0, 10).map(dest => (
                  <div key={dest._id || dest.id} style={{ display: 'inline-block', minWidth: '300px' }}>
                    <DestinationCard {...dest} />
                  </div>
                ))
              ) : (
                <div className="no-data-msg">No destinations found.</div>
              )}
            </div>
            <button className="scroll-arrow right" onClick={() => scrollContainer('right')} aria-label="Scroll right">
              <FaChevronRight />
            </button>
          </div>
        )}
      </motion.div>
    </section>
  );
};
