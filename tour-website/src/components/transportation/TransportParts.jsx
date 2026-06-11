import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaFilter, FaTimes } from 'react-icons/fa';
import { getModeIcon, getFacilityIcon, badgeClass, StarRating } from './TransportHelpers';
import { FACILITIES_LIST, ROUTE_TYPES, COMFORT_LEVELS, SORT_OPTIONS } from './transportData';
import SelfHealingImage from '../common/SelfHealingImage';

// ─── Enhanced Route Card ───────────────────────────────────────
export const RouteCard = ({ item, index, onBook, compareList, onToggleCompare }) => {
  const isCompared = compareList.some(c => c._id === item._id);
  const provider = item.providerName || item.operator;
  const transportType = item.type || item.mode;
  const displayImage = item.heroImage || item.image || item.images?.[0] || item.imagePool?.[0];

  return (
    <motion.div className="tp-route-card tp-animate" style={{ animationDelay: `${index * 0.06}s` }}
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      {item.badge && <span className={`tp-card-badge ${badgeClass(item.badge)}`}>{item.badge}</span>}
      
      <div className="tp-route-operator">
        <div className="tp-route-operator-icon">
          {displayImage ? (
            <SelfHealingImage 
              src={displayImage} 
              alt={provider} 
              entityId={item._id} 
              type="transportation"
              className="tp-operator-img"
            />
          ) : (
            getModeIcon(transportType)
          )}
        </div>
        <div className="tp-route-operator-info">
          <h4>{provider}</h4>
          <span>{transportType} • {item.vehicleType}</span>
          <StarRating rating={item.rating} reviews={item.reviews} />
        </div>
      </div>
      
      <div className="tp-route-times">
        <div className="tp-route-time"><strong>{item.departureTime}</strong><span>{item.from}</span></div>
        <div className="tp-route-duration">
          <span>{item.duration}</span>
          <div className="tp-route-duration-line" />
          <span>{item.routeType || 'direct'}</span>
        </div>
        <div className="tp-route-time"><strong>{item.arrivalTime}</strong><span>{item.to}</span></div>
      </div>
      
      <div className="tp-route-middle">
        {item.facilities?.length > 0 && (
          <div className="tp-card-facilities" style={{ marginTop: 0 }}>
            {item.facilities.slice(0, 5).map(f => (
              <span key={f} className="tp-facility-tag">{getFacilityIcon(f)} {f}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
          {item.comfortLevel && item.comfortLevel !== 'Standard' && <span className="tp-comfort-tag">{item.comfortLevel}</span>}
          {item.seatsAvailable <= 5 && <div className="tp-seat-warning" style={{ marginTop: 0 }}>🔥 Only {item.seatsAvailable} seats left!</div>}
        </div>
      </div>

      <div className="tp-route-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
        <div className="tp-route-price">
          <span className="price-current">₹{item.price?.toLocaleString()}</span>
          {item.originalPrice > item.price && <span className="price-original">₹{item.originalPrice?.toLocaleString()}</span>}
        </div>
        <div className="tp-route-card-actions" style={{ marginTop: 0 }}>
          <label className="tp-compare-check">
            <input type="checkbox" checked={isCompared} onChange={() => onToggleCompare(item)}
              disabled={!isCompared && compareList.length >= 3} />
            Compare
          </label>
          <button className="tp-route-book-btn" onClick={() => onBook(item)}>Book Now</button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Advanced Filter Sidebar ───────────────────────────────────
export const FilterSidebar = ({ open, onClose, filters, setFilters, onApply, onReset }) => {
  const filterCount = (filters.modes?.length || 0) + (filters.facilities?.length || 0)
    + (filters.routeType ? 1 : 0) + (filters.comfortLevel && filters.comfortLevel !== 'All' ? 1 : 0)
    + (filters.rating ? 1 : 0) + (filters.maxPrice < 20000 ? 1 : 0);

  const toggleArr = (key, val) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key]?.includes(val) ? prev[key].filter(v => v !== val) : [...(prev[key] || []), val]
    }));
  };

  return (
    <>
      <div className={`tp-sidebar-overlay ${open ? 'active' : ''}`} onClick={onClose} />
      <aside className={`tp-sidebar ${open ? 'tp-sidebar--open' : ''}`}>
        <div className="tp-sidebar-inner">
          <button className="tp-sidebar-close-mobile" onClick={onClose}>✕ Close Filters</button>
          <div className="tp-sidebar-title">
            <FaFilter /> Filters {filterCount > 0 && <span className="tp-filter-count-badge">{filterCount}</span>}
          </div>

          <div className="tp-filter-group">
            <h4>Transport Mode</h4>
            {['Flight','Train','Cab','Car Rental','Luxury Coach','Bus','Bike'].map(mode => (
              <label key={mode} className="tp-filter-option">
                <input type="checkbox" checked={filters.modes?.includes(mode) || false} onChange={() => toggleArr('modes', mode)} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{getModeIcon(mode)} {mode}</span>
              </label>
            ))}
          </div>

          <div className="tp-filter-divider" />

          <div className="tp-filter-group">
            <h4>Max Price: ₹{(filters.maxPrice || 20000).toLocaleString()}</h4>
            <input type="range" className="tp-price-slider" min="500" max="20000" step="500"
              value={filters.maxPrice || 20000} onChange={e => setFilters(p => ({ ...p, maxPrice: Number(e.target.value) }))} />
            <div className="tp-price-labels"><span>₹500</span><span>₹20,000</span></div>
          </div>

          <div className="tp-filter-divider" />

          <div className="tp-filter-group">
            <h4>Min Rating</h4>
            <div className="tp-route-pills">
              {[0, 3, 3.5, 4, 4.5].map(r => (
                <button key={r} className={`tp-route-pill ${filters.rating === r ? 'active' : ''}`}
                  onClick={() => setFilters(p => ({ ...p, rating: p.rating === r ? 0 : r }))}>
                  {r === 0 ? 'Any' : `${r}+ ★`}
                </button>
              ))}
            </div>
          </div>

          <div className="tp-filter-divider" />

          <div className="tp-filter-group">
            <h4>Facilities</h4>
            <div className="tp-facility-chips">
              {FACILITIES_LIST.map(f => (
                <button key={f} className={`tp-facility-chip ${filters.facilities?.includes(f) ? 'active' : ''}`}
                  onClick={() => toggleArr('facilities', f)}>
                  {getFacilityIcon(f)} {f}
                </button>
              ))}
            </div>
          </div>

          <div className="tp-filter-divider" />

          <div className="tp-filter-group">
            <h4>Route Type</h4>
            <div className="tp-route-pills">
              {ROUTE_TYPES.map(rt => (
                <button key={rt} className={`tp-route-pill ${filters.routeType === rt ? 'active' : ''}`}
                  onClick={() => setFilters(p => ({ ...p, routeType: p.routeType === rt ? '' : rt }))}>
                  {rt}
                </button>
              ))}
            </div>
          </div>

          <div className="tp-filter-divider" />

          <div className="tp-filter-group">
            <h4>Comfort Level</h4>
            {['All', ...COMFORT_LEVELS].map(lvl => (
              <label key={lvl} className="tp-filter-option">
                <input type="radio" name="comfort" checked={filters.comfortLevel === lvl}
                  onChange={() => setFilters(p => ({ ...p, comfortLevel: lvl }))} />
                {lvl}
              </label>
            ))}
          </div>

          <button className="tp-apply-btn" onClick={onApply}>Apply Filters</button>
          {filterCount > 0 && <button className="tp-filter-reset" onClick={onReset}>Reset All Filters</button>}
        </div>
      </aside>
    </>
  );
};

// ─── Sort Bar ──────────────────────────────────────────────────
export const SortBar = ({ total, sort, onSortChange }) => (
  <div className="tp-sort-bar">
    <div className="tp-results-count">Showing <strong>{total}</strong> results</div>
    <select className="tp-sort-select" value={sort} onChange={e => onSortChange(e.target.value)}>
      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ─── Pagination ────────────────────────────────────────────────
export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div className="tp-pagination">
      <button className="tp-page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</button>
      {pages.map(p => (
        <button key={p} className={`tp-page-btn ${p === page ? 'active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      <button className="tp-page-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>›</button>
    </div>
  );
};
