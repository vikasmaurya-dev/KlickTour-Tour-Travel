import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaUsers, FaSuitcase, FaStar, FaShieldAlt, FaChevronRight, FaMapMarkerAlt, FaPlane, FaCar, FaBus, FaTrain, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import transportationService from '../services/transportationService';
import { RouteSkeleton } from '../components/Skeleton';
import { getModeIcon, useReveal, CountUp, FAQItem, BookingModal, FilterChips, CompareBar, CompareModal, SwapButton } from '../components/transportation/TransportHelpers';
import { RouteCard, FilterSidebar, SortBar, Pagination } from '../components/transportation/TransportParts';
import { signatureModes, fleetData, faqData } from '../components/transportation/transportData';
import { matchesSearchFields } from '../utils/search';
import '../styles/Transportation.css';

const modeIconMap = {
  road: FaCar,
  rail: FaTrain,
  flight: FaPlane,
  coach: FaBus,
};

const modeAccentMap = {
  road: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
  rail: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
  flight: 'linear-gradient(135deg, #38bdf8, #2563eb)',
  coach: 'linear-gradient(135deg, #f59e0b, #ef4444)',
};

const TransportVisual = ({ icon = 'road', title, variant = 'fleet' }) => {
  const Icon = modeIconMap[icon] || FaCar;

  return (
    <motion.div
      className={`tp-visual-fallback tp-visual-fallback--${variant} tp-visual-fallback--icon`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3 }}
    >
      <span className="tp-visual-fallback-orb tp-visual-fallback-orb-left" />
      <span className="tp-visual-fallback-orb tp-visual-fallback-orb-right" />
      <motion.div
        className="tp-visual-fallback-icon-shell"
        animate={{ y: [0, -5, 0], rotate: [0, -1.5, 1.5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon className="tp-visual-fallback-icon" />
      </motion.div>
      <div className="tp-visual-fallback-copy">
        <span>{title}</span>
        <small>Animated travel icon</small>
      </div>
    </motion.div>
  );
};

const ModeIconCard = ({ mode, index, visible }) => {
  const Icon = modeIconMap[mode.icon] || FaCar;
  const accent = modeAccentMap[mode.icon] || 'linear-gradient(135deg, #ff4b6e, #3b82f6)';

  return (
    <div
      className="tp-mode-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s ease ${index * 0.12}s`,
      }}
    >
      <div className="tp-mode-card-icon-wrap" style={{ background: accent }}>
        <motion.div
          className="tp-mode-card-icon-orbit tp-mode-card-icon-orbit-left"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="tp-mode-card-icon-orbit tp-mode-card-icon-orbit-right"
          animate={{ rotate: -360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="tp-mode-card-icon-shell"
          animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="tp-mode-card-icon" />
        </motion.div>
      </div>
      <div className="tp-mode-card-body">
        <div className="tp-mode-card-badge" style={{ position: 'static', display: 'inline-flex', marginBottom: 14 }}>
          {mode.badge}
        </div>
        <h3>{mode.title}</h3>
        <p>{mode.desc}</p>
      </div>
    </div>
  );
};

const Transportation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // ─── State ────────────────────────────────────────────────
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [bookingItem, setBookingItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // URL-driven state
  const activeType = searchParams.get('type') || 'all';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentSort = searchParams.get('sort') || 'recommended';

  const [searchForm, setSearchForm] = useState({
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    departure: searchParams.get('departure') || '',
    travelers: searchParams.get('travelers') || '1',
  });

  const [filters, setFilters] = useState({
    modes: [], maxPrice: 20000, luxuryLevel: 'All', comfortLevel: 'All',
    facilities: [], routeType: '', rating: 0,
  });

  const [typeCounts, setTypeCounts] = useState({});
  const routesRef = useRef(null);
  const modesRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // ─── Fetch data ───────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: isMobile ? 6 : 12, sort: currentSort };
      if (activeType !== 'all') params.type = activeType;
      if (searchForm.from) params.from = searchForm.from;
      if (searchForm.to) params.to = searchForm.to;
      if (filters.maxPrice < 20000) params.maxPrice = filters.maxPrice;
      if (filters.rating) params.rating = filters.rating;
      if (filters.comfortLevel && filters.comfortLevel !== 'All') params.comfortLevel = filters.comfortLevel;
      if (filters.routeType) params.routeType = filters.routeType;
      if (filters.facilities?.length > 0) params.facilities = filters.facilities.join(',');

      const res = await transportationService.getAll(params);
      const list = Array.isArray(res) ? res : [];
      setResults(list);
      setTotalResults(Number.isFinite(res.total) ? res.total : list.length);
      setTotalPages(Number.isFinite(res.totalPages) ? res.totalPages : Math.max(1, Math.ceil(list.length / (isMobile ? 6 : 12))));
    } catch (err) {
      console.error('Fetch error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSort, activeType, searchForm.from, searchForm.to, filters, isMobile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch type counts once
  useEffect(() => {
    (async () => {
      try {
        const all = await transportationService.getAll({ limit: 50 });
        const items = Array.isArray(all) ? all : [];
        const counts = {};
        const typeMap = { 'Flight':'flights','Train':'trains','Bus':'buses','Cab':'cabs','Car Rental':'rental','Bike':'bikes','Luxury Coach':'buses' };
        items.forEach(it => { 
          const transportType = it.type || it.mode;
          const k = typeMap[transportType] || 'all'; 
          counts[k] = (counts[k] || 0) + 1; 
        });
        setTypeCounts(counts);
      } catch {}
    })();
  }, []);

  // ─── Handlers ─────────────────────────────────────────────
  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (!val || val === 'all' || val === '1' || val === 'recommended') p.delete(key);
    else p.set(key, val);
    if (key !== 'page') p.delete('page');
    setSearchParams(p, { replace: true });
  };

  const handleTypeChange = (type) => updateParam('type', type);
  const handleSortChange = (sort) => updateParam('sort', sort);
  const handlePageChange = (page) => {
    updateParam('page', String(page));
    routesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    const p = new URLSearchParams();
    if (searchForm.from) p.set('from', searchForm.from);
    if (searchForm.to) p.set('to', searchForm.to);
    if (searchForm.departure) p.set('departure', searchForm.departure);
    if (searchForm.travelers !== '1') p.set('travelers', searchForm.travelers);
    if (activeType !== 'all') p.set('type', activeType);
    setSearchParams(p, { replace: true });
    setTimeout(() => { setSearching(false); routesRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 300);
  };

  const swapCities = () => setSearchForm(p => ({ ...p, from: p.to, to: p.from }));

  const applyFilters = () => { setSidebarOpen(false); updateParam('page', '1'); };
  const resetFilters = () => {
    setFilters({ modes: [], maxPrice: 20000, luxuryLevel: 'All', comfortLevel: 'All', facilities: [], routeType: '', rating: 0 });
    setSidebarOpen(false);
  };

  const toggleCompare = (item) => {
    setCompareList(prev => prev.some(c => c._id === item._id) ? prev.filter(c => c._id !== item._id) : prev.length < 3 ? [...prev, item] : prev);
  };

  const handleLoadMore = () => handlePageChange(currentPage + 1);
  const filteredResults = useMemo(() => {
    const query = `${searchForm.from} ${searchForm.to}`.trim();
    if (!query) return results;

    return results.filter((item) =>
      matchesSearchFields(item, query, [
        'type',
        'mode',
        'providerName',
        'operator',
        'from',
        'to',
        'routeType',
        'description',
      ])
    );
  }, [results, searchForm.from, searchForm.to]);

  // ─── Reveal refs ──────────────────────────────────────────
  const [modesRevealRef, modesVisible] = useReveal();
  const [fleetRevealRef, fleetVisible] = useReveal();
  const [plannerRevealRef, plannerVisible] = useReveal();
  const [faqRevealRef, faqVisible] = useReveal();

  return (
    <div className="transportation-page">
      {/* ══════ HERO ══════ */}
      <section className="tp-hero">
        <div className="tp-hero-bg" />
        <div className="tp-hero-overlay" />
        <div className="tp-hero-content">
          <h1>Choose Your Perfect<br /><span>Travel Mode</span></h1>
          <p className="tp-hero-sub">From luxury flights to scenic rail journeys — explore the most comfortable and reliable ways to reach your dream destination.</p>
          <div className="tp-hero-btns">
            <button className="tp-btn-primary" onClick={() => modesRef.current?.scrollIntoView({ behavior: 'smooth' })}>Explore Options <FaChevronRight size={12} /></button>
            <button className="tp-btn-outline" onClick={() => routesRef.current?.scrollIntoView({ behavior: 'smooth' })}>View Routes <FaArrowRight size={12} /></button>
          </div>
        </div>
      </section>

      {/* ══════ FILTER CHIPS ══════ */}
      <FilterChips activeType={activeType} onTypeChange={handleTypeChange} counts={typeCounts} />

      {/* ══════ SEARCH BAR ══════ */}
      <section className="tp-search-section">
        <form className="tp-search-bar" onSubmit={handleSearch}>
          <div className="tp-search-field">
            <label>From</label>
            <input type="text" placeholder="Departure City" value={searchForm.from} onChange={e => setSearchForm({ ...searchForm, from: e.target.value })} />
          </div>
          <SwapButton onSwap={swapCities} />
          <div className="tp-search-field">
            <label>To</label>
            <input type="text" placeholder="Arrival City" value={searchForm.to} onChange={e => setSearchForm({ ...searchForm, to: e.target.value })} />
          </div>
          <div className="tp-search-field">
            <label>Departure</label>
            <input type="date" min={new Date().toISOString().split('T')[0]} value={searchForm.departure} onChange={e => setSearchForm({ ...searchForm, departure: e.target.value })} />
          </div>
          <div className="tp-search-field">
            <label>Travelers</label>
            <select value={searchForm.travelers} onChange={e => setSearchForm({ ...searchForm, travelers: e.target.value })}>
              {Array.from({ length: 20 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>)}
            </select>
          </div>
          <button type="submit" className="tp-search-btn" disabled={searching}>
            <FaSearch /> {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </section>

      {/* ══════ SIGNATURE TRAVEL MODES ══════ */}
      <section className="tp-section" ref={modesRef}>
        <div className="tp-section-header" ref={modesRevealRef} style={{ opacity: modesVisible ? 1 : 0, transform: modesVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease' }}>
          <h2>Signature <span>Travel Modes</span></h2>
          <p>Hand-picked travel experiences designed for comfort, speed, and unforgettable journeys.</p>
        </div>
        <div className="tp-modes-grid">
          {signatureModes.map((mode, i) => (
            <ModeIconCard key={mode.title} mode={mode} index={i} visible={modesVisible} />
          ))}
        </div>
      </section>

      {/* ══════ MAIN LAYOUT: SIDEBAR + ROUTES ══════ */}
      <div className="tp-main-layout" ref={routesRef}>
        <button className="tp-filter-toggle" onClick={() => setSidebarOpen(true)}><FaFilter /> Filters</button>
        <FilterSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} filters={filters} setFilters={setFilters} onApply={applyFilters} onReset={resetFilters} />

        <div className="tp-content">
          <div className="tp-section-header" style={{ textAlign: 'left', marginBottom: 24 }}>
            <h2>Top Available <span>Routes</span></h2>
            <p>Browse the best deals on verified transport options.</p>
          </div>

          <SortBar total={totalResults} sort={currentSort} onSortChange={handleSortChange} />

          {loading ? (
            <RouteSkeleton count={5} />
          ) : filteredResults.length === 0 ? (
            <div className="tp-no-results">
              <div className="tp-empty-icon">🔍</div>
              <h3>No routes found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="tp-route-list">
                {filteredResults.map((item, i) => (
                  <RouteCard key={item._id || i} item={item} index={i} onBook={setBookingItem} compareList={compareList} onToggleCompare={toggleCompare} />
                ))}
              </div>
              {/* Desktop pagination */}
              {!isMobile && <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
              {/* Mobile load more */}
              {isMobile && currentPage < totalPages && (
                <button className="tp-load-more" onClick={handleLoadMore}>Load More Results</button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════ FLEET SELECTION ══════ */}
      <section className="tp-section">
        <div className="tp-section-header" ref={fleetRevealRef} style={{ opacity: fleetVisible ? 1 : 0, transform: fleetVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease' }}>
          <h2>Fleet <span>Selection</span></h2>
          <p>Choose from our premium fleet of vehicles for every journey type.</p>
        </div>
        <div className="tp-fleet-grid">
          {fleetData.map((v, i) => (
            <div key={i} className="tp-fleet-card" style={{ opacity: fleetVisible ? 1 : 0, transform: fleetVisible ? 'translateY(0)' : 'translateY(30px)', transition: `all 0.6s ease ${i * 0.12}s` }}>
              <div className="tp-fleet-card-img-wrap">
                <TransportVisual icon={v.icon} title={v.name} variant="fleet" />
              </div>
              <div className="tp-fleet-card-body">
                <h3>{v.name}</h3>
                <div className="tp-fleet-meta">
                  <span><FaUsers /> {v.seats} Seats</span>
                  <span><FaSuitcase /> {v.bags} Bags</span>
                  <span><FaStar /> {v.comfort}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ SMART JOURNEY PLANNER ══════ */}
      <section className="tp-section" style={{ padding: '60px 24px' }}>
        <div className="tp-planner" ref={plannerRevealRef} style={{ opacity: plannerVisible ? 1 : 0, transform: plannerVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease' }}>
          <div className="tp-planner-content">
            <h2>Smart <span>Journey Planner</span></h2>
            <p>Combine multiple transport modes into one seamless itinerary. Our smart journey planner optimizes routes, timings, and costs for you.</p>
            <div className="tp-planner-steps">
              <div className="tp-planner-step"><div className="tp-planner-step-icon"><FaMapMarkerAlt /></div><span>Airport Transfer — Premium sedan pickup</span></div>
              <div className="tp-planner-step"><div className="tp-planner-step-icon"><FaPlane /></div><span>New York (JFK) — Direct flight</span></div>
              <div className="tp-planner-step"><div className="tp-planner-step-icon"><FaCar /></div><span>Destination Drive — SUV to final stop</span></div>
            </div>
            <button className="tp-btn-primary" onClick={() => routesRef.current?.scrollIntoView({ behavior: 'smooth' })}>Plan My Journey <FaChevronRight size={12} /></button>
          </div>
          <div className="tp-planner-image"><img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800" alt="Journey Route" loading="lazy" /></div>
        </div>
      </section>

      {/* ══════ TRUST STATS ══════ */}
      <section className="tp-stats">
        <div className="tp-stats-grid">
          <div className="tp-stat-card"><div className="tp-stat-number"><CountUp target={1000} suffix="+" /></div><div className="tp-stat-label">Verified Partners</div></div>
          <div className="tp-stat-card"><div className="tp-stat-number"><CountUp target={250} suffix="+" /></div><div className="tp-stat-label">Global Cities</div></div>
          <div className="tp-stat-card"><div className="tp-stat-number">24/7</div><div className="tp-stat-label">Ready Support</div></div>
          <div className="tp-stat-card"><div className="tp-stat-number"><FaShieldAlt style={{ fontSize: '2.5rem', color: '#ff4b6e' }} /></div><div className="tp-stat-label">Ride & Booking Safety</div></div>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="tp-section">
        <div className="tp-section-header" ref={faqRevealRef} style={{ opacity: faqVisible ? 1 : 0, transform: faqVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease' }}>
          <h2>Travel <span>Insights</span></h2>
          <p>Common questions about our transport services answered.</p>
        </div>
        <div className="tp-faq">{faqData.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}</div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="tp-cta">
        <div className="tp-cta-bg" />
        <div className="tp-cta-content">
          <h2>Ready to Travel<br /><span>Smarter?</span></h2>
          <p>Experience travel at its finest with handcrafted itineraries, luxury vehicles, and world&#8209;class service on every route.</p>
          <button className="tp-cta-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Start Your Journey <FaArrowRight /></button>
        </div>
      </section>

      {/* ══════ COMPARE BAR ══════ */}
      <AnimatePresence>
        {compareList.length > 0 && <CompareBar items={compareList} onRemove={id => setCompareList(p => p.filter(c => c._id !== id))} onCompare={() => setShowCompare(true)} onClear={() => setCompareList([])} />}
      </AnimatePresence>

      {/* ══════ COMPARE MODAL ══════ */}
      {showCompare && <CompareModal items={compareList} onClose={() => setShowCompare(false)} />}

      {/* ══════ BOOKING MODAL ══════ */}
      {bookingItem && <BookingModal item={bookingItem} onClose={() => setBookingItem(null)} />}
    </div>
  );
};

export default Transportation;
