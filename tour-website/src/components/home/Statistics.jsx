import React from 'react';
import { motion } from 'framer-motion';
import CountUpModule from 'react-countup';

const CountUp = CountUpModule.default || CountUpModule;

const scaleUpVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const stats = [
  { value: 15000, suffix: '+', label: 'Happy Travelers' },
  { value: 500, suffix: '+', label: 'Destinations' },
  { value: 100, suffix: '+', label: 'Tour Packages' },
  { value: 15, suffix: '+', label: 'Years Experience' }
];

export const Statistics = () => {
  return (
    <section className="section statistics section-muted">
      <motion.div 
        className="container section-content-centered"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div key={index} className="stat-item" variants={scaleUpVariant}>
              <div className="stat-number">
                <CountUp 
                  end={stat.value} 
                  duration={2.5} 
                  suffix={stat.suffix} 
                />
              </div>
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
