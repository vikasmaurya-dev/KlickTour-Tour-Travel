import React, { useState, useEffect, useRef } from 'react';
import { FaPlane, FaTrain, FaTaxi, FaCar, FaBus, FaMotorcycle, FaStar, FaPlus, FaTimes, FaWifi, FaSnowflake, FaUtensils, FaBolt, FaSuitcase, FaBed, FaPaw, FaExchangeAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mode icon helper ──────────────────────────────────────────
export const getModeIcon = (mode) => {
  const map = { 'Flight': FaPlane, 'Train': FaTrain, 'Cab': FaTaxi, 'Car Rental': FaCar, 'Bus': FaBus, 'Luxury Coach': FaBus, 'Bike': FaMotorcycle };
  const Icon = map[mode] || FaCar;
  return <Icon />;
};

// ─── Facility icon helper ──────────────────────────────────────
export const getFacilityIcon = (f) => {
  const map = { 'AC': FaSnowflake, 'Wi-Fi': FaWifi, 'Food': FaUtensils, 'Charging Port': FaBolt, 'Luggage': FaSuitcase, 'Sleeper': FaBed, 'Pet Friendly': FaPaw };
  const Icon = map[f] || FaBolt;
  return <Icon size={10} />;
};

// ─── Badge class helper ────────────────────────────────────────
export const badgeClass = (badge) => {
  if (!badge) return '';
  return badge.toLowerCase().replace(/\s+/g, '-');
};

// ─── Scroll-reveal hook ────────────────────────────────────────
export const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

// ─── Count-up animation ────────────────────────────────────────
export const CountUp = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── FAQ Item ──────────────────────────────────────────────────
export const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`tp-faq-item ${open ? 'active' : ''}`}>
      <button className="tp-faq-question" onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span className={`tp-faq-icon ${open ? 'open' : ''}`}><FaPlus /></span>
      </button>
      <div className={`tp-faq-answer ${open ? 'open' : ''}`}><p>{a}</p></div>
    </div>
  );
};

// ─── Booking Modal ─────────────────────────────────────────────
export const BookingModal = ({ item, onClose }) => {
  if (!item) return null;
  return (
    <AnimatePresence>
      <motion.div className="tp-modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="tp-modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', damping: 20 }}>
          <h3>Confirm Booking</h3>
          <p className="tp-modal-sub">Review your travel details below</p>
          <div className="tp-modal-details">
            <div className="tp-modal-detail"><span>Operator</span><span>{item.providerName || item.operator}</span></div>
            <div className="tp-modal-detail"><span>Route</span><span>{item.from} → {item.to}</span></div>
            <div className="tp-modal-detail"><span>Mode</span><span>{item.type || item.mode}</span></div>
            <div className="tp-modal-detail"><span>Duration</span><span>{item.duration}</span></div>
            <div className="tp-modal-detail"><span>Price</span><span>₹{item.price?.toLocaleString()}</span></div>
          </div>
          <div className="tp-modal-actions">
            <button className="tp-modal-close" onClick={onClose}>Cancel</button>
            <button className="tp-modal-confirm" onClick={() => { alert('Booking confirmed!'); onClose(); }}>Confirm Booking</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Filter Chips ──────────────────────────────────────────────
const CHIP_DATA = [
  { key: 'all', label: 'All', icon: null },
  { key: 'flights', label: 'Flights', icon: FaPlane },
  { key: 'trains', label: 'Trains', icon: FaTrain },
  { key: 'buses', label: 'Buses', icon: FaBus },
  { key: 'cabs', label: 'Cabs', icon: FaTaxi },
  { key: 'rental', label: 'Rental Cars', icon: FaCar },
  { key: 'bikes', label: 'Bikes', icon: FaMotorcycle },
];

export const FilterChips = ({ activeType, onTypeChange, counts }) => (
  <section className="tp-chips-section">
    <div className="tp-chips-row">
      {CHIP_DATA.map(c => {
        const Icon = c.icon;
        const count = counts?.[c.key] || 0;
        return (
          <motion.button key={c.key} className={`tp-chip ${activeType === c.key ? 'active' : ''}`}
            onClick={() => onTypeChange(c.key)} whileTap={{ scale: 0.95 }} layout>
            {Icon && <Icon size={14} />}
            {c.label}
            {c.key !== 'all' && count > 0 && <span className="chip-count">{count}</span>}
          </motion.button>
        );
      })}
    </div>
  </section>
);

// ─── Compare Bar ───────────────────────────────────────────────
export const CompareBar = ({ items, onRemove, onCompare, onClear }) => {
  if (items.length === 0) return null;
  return (
    <motion.div className="tp-compare-bar" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
      <div className="tp-compare-bar-items">
        <strong style={{ color: '#ff4b6e', marginRight: 8 }}>Compare ({items.length}/3)</strong>
        {items.map(it => (
          <div key={it._id} className="tp-compare-bar-item">
            {it.providerName || it.operator} <button onClick={() => onRemove(it._id)}>×</button>
          </div>
        ))}
      </div>
      <div className="tp-compare-bar-actions">
        <button className="tp-compare-btn" onClick={onCompare} disabled={items.length < 2}>Compare Now</button>
        <button className="tp-compare-clear" onClick={onClear}>Clear</button>
      </div>
    </motion.div>
  );
};

// ─── Compare Modal ─────────────────────────────────────────────
export const CompareModal = ({ items, onClose }) => {
  if (!items || items.length < 2) return null;
  const cheapest = Math.min(...items.map(i => i.price));
  const bestRated = Math.max(...items.map(i => i.rating));
  const rows = [
    { label: 'Mode', render: i => i.type || i.mode },
    { label: 'Vehicle', key: 'vehicleType' },
    { label: 'Route', render: i => `${i.from} → ${i.to}` },
    { label: 'Duration', key: 'duration' },
    { label: 'Departure', key: 'departureTime' },
    { label: 'Price', render: i => `₹${i.price?.toLocaleString()}`, best: i => i.price === cheapest },
    { label: 'Rating', render: i => `${i.rating} ★`, best: i => i.rating === bestRated },
    { label: 'Comfort', key: 'comfortLevel' },
    { label: 'Route Type', key: 'routeType' },
    { label: 'Seats Left', key: 'seatsAvailable' },
    { label: 'Facilities', render: i => (i.facilities || []).join(', ') || '—' },
  ];
  return (
    <motion.div className="tp-compare-modal-overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="tp-compare-modal" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
        <h3>Compare Transport Options</h3>
        <table>
          <thead><tr><th>Feature</th>{items.map(it => <th key={it._id}>{it.providerName || it.operator}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td style={{ color: '#888', fontWeight: 600 }}>{r.label}</td>
                {items.map(it => {
                  const val = r.render ? r.render(it) : it[r.key] ?? '—';
                  const isBest = r.best ? r.best(it) : false;
                  return <td key={it._id} className={isBest ? 'best' : ''}>{val}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <button className="tp-compare-clear" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Swap Button ───────────────────────────────────────────────
export const SwapButton = ({ onSwap }) => (
  <motion.button type="button" onClick={onSwap} className="tp-swap-btn"
    whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}
    style={{ background: 'linear-gradient(135deg,#ff4b6e,#ff8f6b)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}>
    <FaExchangeAlt size={14} />
  </motion.button>
);

// ─── Star Rating ───────────────────────────────────────────────
export const StarRating = ({ rating, reviews }) => (
  <div className="tp-card-rating">
    {[1,2,3,4,5].map(s => <FaStar key={s} size={12} style={{ color: s <= Math.round(rating) ? '#fbbf24' : '#333' }} />)}
    <span>{rating}</span>
    {reviews > 0 && <span>({reviews.toLocaleString()})</span>}
  </div>
);
