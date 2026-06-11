import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaHeart, FaWifi, FaSwimmingPool, FaDumbbell, FaSpa, FaUtensils, FaConciergeBell, FaGlassMartiniAlt, FaParking, FaPaw } from 'react-icons/fa';
import CardImageGallery from './common/CardImageGallery';

const iconMap = {
  "Free WiFi": <FaWifi />,
  "Swimming Pool": <FaSwimmingPool />,
  "Fitness Center": <FaDumbbell />,
  "Spa & Wellness": <FaSpa />,
  "Restaurant": <FaUtensils />,
  "Room Service": <FaConciergeBell />,
  "Bar": <FaGlassMartiniAlt />,
  "Free Parking": <FaParking />,
  "Pet Friendly": <FaPaw />
};

export const HotelCard = ({ id, name, location, rating, pricePerNight, images, imagePool, isFeatured, image, heroImage, amenities }) => {
  const navigate = useNavigate();
  const displayImage = heroImage || images?.[0] || image;

  return (
    <motion.div 
      className="bg-white dark:bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800 transition-all duration-300 flex flex-col h-full relative"
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Top Image Box */}
      <div className="relative h-56 w-full cursor-pointer">
        <CardImageGallery 
          mainImage={displayImage}
          gallery={images}
          imagePool={imagePool}
          alt={`${name} | ${location}`}
          entityId={id}
          type="hotel"
          onClick={() => navigate(`/hotels/${id}`)}
        />
        
        {/* Badges & Icons */}
        <button className="absolute top-4 right-4 bg-white/80 dark:bg-black/50 p-2 rounded-full backdrop-blur-md text-gray-400 hover:text-rose-500 transition-colors z-10">
          <FaHeart size={18} />
        </button>

        {isFeatured && (
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col cursor-pointer" onClick={() => navigate(`/hotels/${id}`)}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">{name}</h3>
          <div className="flex items-center text-amber-500 font-bold text-sm bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
            <FaStar className="mr-1" size={12} />
            {rating.toFixed(1)}
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center mb-4">
          <FaMapMarkerAlt className="mr-1.5" size={12} />
          {location}
        </p>

        {/* Amenities Icons */}
        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {amenities.slice(0, 4).map((amenity, idx) => (
            <div key={idx} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center pointer-events-none" title={amenity}>
              {iconMap[amenity] || <FaWifi />}
            </div>
          ))}
          {amenities.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 flex items-center justify-center text-xs font-bold">
              +{amenities.length - 4}
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="flex justify-between items-end pt-4 border-t border-gray-100 dark:border-zinc-800">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Starting from</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              ₹{pricePerNight.toLocaleString()} <span className="text-sm font-normal text-gray-500">/night</span>
            </div>
          </div>
          
          <button 
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-md hover:shadow-blue-500/30"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hotels/${id}`);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};
