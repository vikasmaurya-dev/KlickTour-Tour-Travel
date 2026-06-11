import React from 'react';
import { motion } from 'framer-motion';
import { FaGlobeAmericas, FaHotel, FaPlane, FaUsers } from 'react-icons/fa';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const WhyChooseUs = () => {
  return (
    <section className="section features">
      <motion.div 
        className="container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <div className="features-grid features-grid-centered">
          <motion.div className="feature-item" variants={fadeUpVariant} whileHover={{ y: -10, scale: 1.05 }}>
            <div className="feature-icon"><FaGlobeAmericas /></div>
            <h3>World class Services</h3>
            <p>We provide the best travel services worldwide.</p>
          </motion.div>
          <motion.div className="feature-item feature-item-highlight" variants={fadeUpVariant} whileHover={{ y: -10, scale: 1.05 }}>
            <div className="feature-icon"><FaHotel /></div>
            <h3>Handpicked Hotels</h3>
            <p>Best places to stay that suit your budget and style.</p>
          </motion.div>
          <motion.div className="feature-item" variants={fadeUpVariant} whileHover={{ y: -10, scale: 1.05 }}>
            <div className="feature-icon"><FaPlane /></div>
            <h3>Fastest Travel</h3>
            <p>We partner with top airlines for smooth flights.</p>
          </motion.div>
          <motion.div className="feature-item" variants={fadeUpVariant} whileHover={{ y: -10, scale: 1.05 }}>
            <div className="feature-icon"><FaUsers /></div>
            <h3>24/7 Support</h3>
            <p>Our dedicated team is here to help anytime, anywhere.</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
