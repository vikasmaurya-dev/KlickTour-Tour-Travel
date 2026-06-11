import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { api } from '../../services/api';
import { getDestinationFallbackImages, getFallbackImage, getHotelFallbackImages, uniqueImageUrls } from '../../utils/imageHelper';

const MAX_IMAGE_POOL = 5;

const uniqueStrings = (values = []) => {
  const seen = new Set();
  return values.filter(Boolean).filter((value) => {
    const next = String(value).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

const buildFallbackContext = (alt = '', type = 'destination') => {
  const raw = String(alt || '').trim();
  const parts = raw.split(/[|,-]/).map((part) => part.trim()).filter(Boolean);
  const location = parts[0] || raw || type;

  return {
    name: raw || type,
    location,
    category: type,
  };
};

/**
 * Self-healing image loader with smart fallback rotation.
 */
const SelfHealingImage = ({ src, alt, className, entityId, type, onHeal }) => {
  const fallbackContext = useMemo(() => buildFallbackContext(alt, type), [alt, type]);
  const initialFallbackPool = useMemo(
    () => uniqueImageUrls(uniqueStrings([
      src,
      ...(type === 'hotel'
        ? getHotelFallbackImages(fallbackContext)
        : getDestinationFallbackImages(fallbackContext)),
    ])).slice(0, MAX_IMAGE_POOL),
    [src, type, fallbackContext]
  );

  const [currentSrc, setCurrentSrc] = useState(src || initialFallbackPool[0] || getFallbackImage(alt, type));
  const [fallbackPool, setFallbackPool] = useState(initialFallbackPool);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [smartResolved, setSmartResolved] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const repairInFlightRef = useRef(false);
  const repairedKeysRef = useRef(new Set());

  React.useEffect(() => {
    const nextPool = uniqueImageUrls(uniqueStrings([
      src,
      ...(type === 'hotel'
        ? getHotelFallbackImages(fallbackContext)
        : getDestinationFallbackImages(fallbackContext)),
    ]));
    setImageLoaded(false);
    setCurrentSrc(src || nextPool[0] || getFallbackImage(alt, type));
    setFallbackPool(nextPool.slice(0, MAX_IMAGE_POOL));
    setFallbackIndex(0);
    setSmartResolved(false);
  }, [src, alt, type, fallbackContext]);

  const applyResolvedPool = (resolved, { showResolvedImage = false } = {}) => {
    const nextPool = uniqueImageUrls(uniqueStrings([
      resolved?.heroImage,
      resolved?.newUrl,
      ...(resolved?.rotationPool || resolved?.imagePool || []),
      ...(resolved?.gallery || []),
      ...fallbackPool,
    ])).slice(0, MAX_IMAGE_POOL);

    if (nextPool.length > 0) {
      setFallbackPool(nextPool);
      if (showResolvedImage) {
        setImageLoaded(false);
        setFallbackIndex(0);
        setCurrentSrc(nextPool[0]);
      }
      if (onHeal) onHeal(resolved);
    }
  };

  const applySmartFallback = async ({ showResolvedImage = false } = {}) => {
    if (smartResolved) return;
    setSmartResolved(true);

    try {
      const resolved = await api.resolveSmartImages({
        ...buildFallbackContext(alt, type),
        type,
        forceRefresh: false,
      });

      applyResolvedPool(resolved, { showResolvedImage });
    } catch (err) {
      console.warn('[Healing] Smart fallback resolver failed:', err?.message || err);
    }
  };

  const repairInBackground = async (brokenSrc) => {
    const repairKey = `${type || 'image'}:${entityId || alt}:${brokenSrc || ''}`;
    if (repairInFlightRef.current || repairedKeysRef.current.has(repairKey)) return;

    repairInFlightRef.current = true;
    repairedKeysRef.current.add(repairKey);

    try {
      let result = null;
      if (entityId) {
        switch (type) {
          case 'destination':
            result = await api.healDestinationImage(entityId);
            break;
          case 'package':
            result = await api.healPackageImage(entityId);
            break;
          case 'hotel':
            result = await api.healHotelImage(entityId);
            break;
          case 'transportation':
            result = await api.healTransportationImage(entityId);
            break;
          default:
            result = null;
        }
      }

      if (result) {
        applyResolvedPool(result);
      }

      if (!result?.newUrl && !smartResolved) {
        await applySmartFallback();
      }
    } catch (err) {
      console.error(`[Healing] Silent repair failed for ${alt}:`, err);
      if (!smartResolved) {
        await applySmartFallback();
      }
    } finally {
      repairInFlightRef.current = false;
    }
  };

  const handleImageError = () => {
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < fallbackPool.length) {
      setFallbackIndex(nextIndex);
      setImageLoaded(false);
      setCurrentSrc(fallbackPool[nextIndex]);
      repairInBackground(currentSrc);
      return;
    }

    setImageLoaded(false);
    setCurrentSrc(getFallbackImage(alt, type));
    repairInBackground(currentSrc);
  };

  return (
    <div className={`healing-img-container ${className || ''}`} style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
      {!imageLoaded && (
        <div
          className="healing-img-placeholder"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #155e75 52%, #334155 100%)',
          }}
        >
          <FaSync
            className="healing-placeholder-icon"
            style={{
              color: 'rgba(226, 232, 240, 0.64)',
              animation: 'spin 1.2s linear infinite',
            }}
          />
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          className={className}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AnimatePresence>
    </div>
  );
};

export default SelfHealingImage;
