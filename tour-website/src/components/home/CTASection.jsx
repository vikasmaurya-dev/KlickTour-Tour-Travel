import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const CTASection = () => {
  return (
    <section className="section final-cta">
      <motion.div 
        className="container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUpVariant}
      >
        <div className="cta-box glass-surface cta-box-centered">
          <h2>Ready to explore the world?</h2>
          <p>Start planning your perfect journey with KlickTour today. Your next adventure is just a click away.</p>
          <div className="cta-btns">
            <Link to="/packages" className="btn btn-primary premium-btn">
              Explore Packages
              <span className="btn-glow"></span>
            </Link>
            <Link to="/contact" className="btn btn-outline premium-btn">
              Contact Us
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
