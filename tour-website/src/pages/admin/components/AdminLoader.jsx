import React from 'react';
import { motion } from 'framer-motion';

const AdminLoader = ({ message = "Synchronizing Protocol Data..." }) => {
  return (
    <div className="admin-loading-container">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
          className="admin-loader"
        />
        {message && <p className="admin-loading-text">{message}</p>}
      </div>
    </div>
  );
};

export default AdminLoader;
