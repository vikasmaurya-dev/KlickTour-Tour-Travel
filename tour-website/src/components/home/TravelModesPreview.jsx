import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlane, FaTrain, FaBus, FaCar, FaMotorcycle } from 'react-icons/fa';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const travelModes = [
  { id: 'flight', name: 'Flights', icon: <FaPlane />, path: '/transportation?type=flights', desc: 'Fastest way to reach' },
  { id: 'train', name: 'Trains', icon: <FaTrain />, path: '/transportation?type=trains', desc: 'Scenic journey' },
  { id: 'bus', name: 'Buses', icon: <FaBus />, path: '/transportation?type=buses', desc: 'Budget friendly' },
  { id: 'cab', name: 'Cabs', icon: <FaCar />, path: '/transportation?type=cabs', desc: 'Private comfort' },
  { id: 'bike', name: 'Bike Rental', icon: <FaMotorcycle />, path: '/transportation?type=bikes', desc: 'Adventure awaits' },
];

export const TravelModesPreview = () => {
  return (
    <section className="section travel-modes-preview section-dark">
      <motion.div 
        className="container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <div className="section-header section-header-centered">
          <h2 className="section-title">Travel Your Way</h2>
          <p className="section-subtitle">Choose from our various travel modes for a perfect journey</p>
        </div>

        <div className="travel-modes-grid">
          {travelModes.map((mode) => (
            <motion.div 
              key={mode.id}
              className="travel-mode-card"
              variants={fadeUpVariant}
              whileHover={{ y: -10 }}
            >
              <Link to={mode.path} className="travel-mode-link">
                <div className="mode-icon-wrapper">
                  {mode.icon}
                </div>
                <h3>{mode.name}</h3>
                <p>{mode.desc}</p>
                <span className="mode-cta">Book Now</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
