import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import './ImagePreviewModal.css';

const ImagePreviewModal = ({ isOpen, onClose, images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastOpen, setLastOpen] = useState(isOpen);

  if (isOpen !== lastOpen) {
    setLastOpen(isOpen);
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setLoading(true);
      setError(false);
    }
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?auto=format&fit=crop&w=1200&q=80';

  const validImages = React.useMemo(() => {
    const filtered = Array.isArray(images) 
      ? images.filter(img => typeof img === 'string' && img.trim() !== '')
      : [];
    
    return filtered.length > 0 ? filtered : [fallbackImage];
  }, [images]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setLoading(true);
    setError(false);
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setLoading(true);
    setError(false);
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  }, [handleNext, handlePrev, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="image-preview-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="image-preview-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="preview-close-btn" onClick={onClose} aria-label="Close preview">
              <IoClose />
            </button>

            {validImages.length > 1 && (
              <>
                <button className="preview-nav-btn prev" onClick={handlePrev} aria-label="Previous image">
                  <IoChevronBack />
                </button>
                <button className="preview-nav-btn next" onClick={handleNext} aria-label="Next image">
                  <IoChevronForward />
                </button>
              </>
            )}

            <div className="preview-content">
              {loading && (
                <div className="preview-loader">
                  <div className="spinner"></div>
                  <span>Loading Image...</span>
                </div>
              )}
              {error && !loading && (
                <div className="preview-error">
                  <p>Image could not be loaded</p>
                  <button onClick={() => { setError(false); setLoading(true); }}>Retry</button>
                </div>
              )}
              <motion.img 
                key={currentIndex}
                src={validImages[currentIndex]} 
                alt={`Preview ${currentIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: loading ? 0 : 1,
                  scale: loading ? 0.95 : 1
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onLoad={() => {
                  setLoading(false);
                  setError(false);
                }}
                onError={(e) => {
                  console.error("Image failed to load in preview:", validImages[currentIndex]);
                  setLoading(false);
                  setError(true);
                  if (e.target.src !== fallbackImage) {
                    e.target.src = fallbackImage;
                  }
                }}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  display: error ? 'none' : 'block'
                }}
              />
            </div>

            <div className="preview-counter">
              <span>{currentIndex + 1}</span> / {validImages.length}
            </div>

            {validImages.length > 1 && (
              <div className="preview-thumbnails">
                {validImages.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`thumb-item ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      if (idx !== currentIndex) {
                        setLoading(true);
                        setError(false);
                        setCurrentIndex(idx);
                      }
                    }}
                  >
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};


export default ImagePreviewModal;
