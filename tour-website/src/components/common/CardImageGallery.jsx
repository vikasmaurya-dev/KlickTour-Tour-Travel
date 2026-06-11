import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaImages, FaEye, FaSync } from 'react-icons/fa';
import SelfHealingImage from './SelfHealingImage';
import ImagePreviewModal from './ImagePreviewModal';
import { api } from '../../services/api';
import { detectDestinationKey, getDestinationFallbackImages, getHotelFallbackImages, uniqueImageUrls } from '../../utils/imageHelper';
import './CardImageGallery.css';

const MAX_CARD_PHOTOS = 5;

/**
 * Premium Hover-based Multi-image Preview component for cards.
 */
const CardImageGallery = ({ mainImage, gallery = [], imagePool = [], alt, entityId, type, onClick }) => {
  const [currentGallery, setCurrentGallery] = useState(gallery || []);
  const [currentImagePool, setCurrentImagePool] = useState(imagePool || []);
  const [currentMainImage, setCurrentMainImage] = useState(mainImage);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [initialPreviewIndex, setInitialPreviewIndex] = useState(0);
  const [isEnriching, setIsEnriching] = useState(false);

  React.useEffect(() => {
    setCurrentMainImage((prev) => (prev !== mainImage ? mainImage : prev));
  }, [mainImage]);

  React.useEffect(() => {
    setCurrentGallery((prev) => {
      const newGallery = gallery || [];
      if (prev.length === newGallery.length && prev.every((v, i) => v === newGallery[i])) {
        return prev;
      }
      return newGallery;
    });
  }, [gallery]);

  React.useEffect(() => {
    setCurrentImagePool((prev) => {
      const nextPool = imagePool || [];
      if (prev.length === nextPool.length && prev.every((v, i) => v === nextPool[i])) {
        return prev;
      }
      return nextPool;
    });
  }, [imagePool]);

  const enrichAttempted = React.useRef(false);

  React.useEffect(() => {
    setSlideIndex(0);
    enrichAttempted.current = false;
  }, [entityId]);

  const contextualFallbacks = React.useMemo(() => {
    const context = { name: alt, location: alt, category: type };
    return type === 'hotel'
      ? getHotelFallbackImages(context)
      : getDestinationFallbackImages(context);
  }, [alt, type]);

  const fullImagesList = React.useMemo(() => {
    const suppliedImages = uniqueImageUrls([currentMainImage, ...(currentGallery || []), ...(currentImagePool || [])]);
    const fallbackImages = uniqueImageUrls(contextualFallbacks);
    const ordered = suppliedImages.length > 0
      ? [...suppliedImages, ...fallbackImages]
      : fallbackImages;
    return uniqueImageUrls(ordered).slice(0, MAX_CARD_PHOTOS);
  }, [currentMainImage, currentGallery, currentImagePool, contextualFallbacks, alt, type]);

  const storedImagesCount = React.useMemo(
    () => uniqueImageUrls([currentMainImage, ...(currentGallery || []), ...(currentImagePool || [])]).length,
    [currentMainImage, currentGallery, currentImagePool]
  );

  React.useEffect(() => {
    if (fullImagesList.length <= 1) return;

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % fullImagesList.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [fullImagesList.length]);

  React.useEffect(() => {
    if (enrichAttempted.current || !entityId || !type) return;

    if (storedImagesCount >= 4) {
      enrichAttempted.current = true;
      return;
    }

    const timer = setTimeout(async () => {
      if (enrichAttempted.current) return;
      enrichAttempted.current = true;
      setIsEnriching(true);

      try {
        let result;
        switch (type) {
          case 'destination': result = await api.healDestinationImage(entityId); break;
          case 'package': result = await api.healPackageImage(entityId); break;
          case 'hotel': result = await api.healHotelImage(entityId); break;
          case 'transportation': result = await api.healTransportationImage(entityId); break;
          default: return;
        }

        if (result) {
          if (result.newUrl) setCurrentMainImage(result.newUrl);
          if (result.gallery && result.gallery.length > 0) {
            setCurrentGallery((prev) => (prev.length === result.gallery.length ? prev : result.gallery));
          }
          if (result.rotationPool && result.rotationPool.length > 0) {
            setCurrentImagePool(result.rotationPool);
          } else if (result.imagePool && result.imagePool.length > 0) {
            setCurrentImagePool(result.imagePool);
          }
        }
      } catch (err) {
        console.error(`[Gallery] âŒ Enrichment failed:`, err);
      } finally {
        setIsEnriching(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [entityId, type, storedImagesCount]);

  const handleHeal = useCallback((result) => {
    if (result.newUrl) setCurrentMainImage(result.newUrl);
    if (result.gallery && result.gallery.length > 0) {
      setCurrentGallery(result.gallery);
    }
    if (result.rotationPool && result.rotationPool.length > 0) {
      setCurrentImagePool(result.rotationPool);
    } else if (result.imagePool && result.imagePool.length > 0) {
      setCurrentImagePool(result.imagePool);
    }
  }, []);

  const openPreview = useCallback((e) => {
    e.stopPropagation();
    setInitialPreviewIndex(slideIndex);
    setIsPreviewOpen(true);
  }, [slideIndex]);

  return (
    <>
      <div
        className="card-gallery-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div className="card-gallery-slider">
          <AnimatePresence>
            <motion.div
              key={slideIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="card-gallery-slide"
              onClick={openPreview}
            >
              <SelfHealingImage
                src={fullImagesList[slideIndex]}
                alt={`${alt} - view ${slideIndex + 1}`}
                className="card-gallery-main-img"
                entityId={entityId}
                type={type}
                onHeal={handleHeal}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="card-gallery-overlay-elements">
          {fullImagesList.length > 1 && (
            <div className="slider-dots">
              {fullImagesList.map((_, idx) => (
                <div
                  key={idx}
                  className={`slider-dot ${idx === slideIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideIndex(idx);
                  }}
                />
              ))}
            </div>
          )}

          <div className="photo-count-tag">
            <FaImages size={12} />
            <span>{fullImagesList.length} Photos</span>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="hover-action-hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <FaEye /> View Gallery
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isEnriching && (
          <div className="gallery-enrich-loader">
            <FaSync className="kt-spin" />
          </div>
        )}
      </div>

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={fullImagesList}
        initialIndex={initialPreviewIndex}
      />
    </>
  );
};

export default CardImageGallery;
