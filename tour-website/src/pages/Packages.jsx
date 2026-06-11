import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import {
  FaRoute, FaMagic, FaSearch, FaSortAmountDown, FaStar,
  FaCompass, FaUmbrellaBeach, FaMountain, FaHiking, FaPray,
  FaHistory, FaHeart, FaPaw, FaCity, FaSun, FaGlobe, FaFilter, FaTimes,
  FaThLarge, FaList, FaSortAmountUp, FaArrowRight
} from 'react-icons/fa';
import { PackageCard } from '../components/Cards';
import { CardSkeleton } from '../components/Skeleton';
import { api } from '../services/api';
import Pagination from '../components/common/Pagination';
import { matchesSearchFields } from '../utils/search';
import './Packages.css';

const CATEGORIES = [
  { id: 'All', name: 'All', icon: <FaCompass /> },
  { id: 'Beach', name: 'Beach', icon: <FaUmbrellaBeach /> },
  { id: 'Adventure', name: 'Adventure', icon: <FaHiking /> },
  { id: 'City', name: 'City', icon: <FaCity /> },
  { id: 'Honeymoon', name: 'Honeymoon', icon: <FaHeart /> },
  { id: 'Family', name: 'Family', icon: <FaSun /> },
  { id: 'Corporate', name: 'Corporate', icon: <FaGlobe /> },
  { id: 'Hill Station', name: 'Hill Station', icon: <FaMountain /> },
  { id: 'Wildlife', name: 'Wildlife', icon: <FaPaw /> },
  { id: 'Cultural', name: 'Cultural', icon: <FaHistory /> },
  { id: 'Pilgrimage', name: 'Pilgrimage', icon: <FaPray /> },
];

const GROUP_TYPES = ['Family', 'Couple', 'Solo', 'Friends', 'Corporate'];
const COMFORT_LEVELS = ['Budget', 'Standard', 'Deluxe', 'Luxury'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DURATIONS = [
  { label: '1-3 Days', value: '1-3' },
  { label: '4-6 Days', value: '4-6' },
  { label: '7-10 Days', value: '7-10' },
  { label: '10+ Days', value: '10+' }
];

const normalizeCardKey = (value = '') => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ');

const dedupeByPlace = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeCardKey(item?.location || item?.name || item?._id || item?.id);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const Packages = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [particlesInit, setParticlesInit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  const [isEcoOnly, setIsEcoOnly] = useState(searchParams.get('isEcoFriendly') === 'true');
  const [isLuxuryOnly, setIsLuxuryOnly] = useState(searchParams.get('comfortLevel') === 'Luxury');
  const [isTrendingOnly, setIsTrendingOnly] = useState(searchParams.get('isTrending') === 'true');
  const [limit, setLimit] = useState(6);

  // Pagination metadata
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // State derived from URL
  const activeCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const groupTypeParam = searchParams.get('groupType') || '';
  const durationParam = searchParams.get('duration') || '';
  const ratingParam = searchParams.get('rating') || '';
  const comfortLevelParam = searchParams.get('comfortLevel') || '';
  const monthParam = searchParams.get('month') || '';

  const groupTypes = groupTypeParam ? groupTypeParam.split(',') : [];
  const filteredPackages = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return dedupeByPlace(packages);

    return dedupeByPlace(packages.filter((pkg) =>
      matchesSearchFields(pkg, query, [
        'name',
        'location',
        'category',
        'description',
        'duration',
        'badge',
        'country',
        'aiSearchQuery',
      ])
    ));
  }, [packages, searchQuery]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setParticlesInit(true);
    });
  }, []);

  const fetchPackages = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      if (isLoadMore) {
        params.set('page', page + 1);
      }

      const data = await api.getPackages(params.toString());
      if (data && data.success) {
        if (isLoadMore) {
          setPackages(prev => dedupeByPlace([...prev, ...(data.data || [])]));
          updateParams({ page: page + 1 });
        } else {
          setPackages(dedupeByPlace(data.data || []));
          setTotalPages(data.totalPages || 1);
          setTotalResults(data.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, page]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    // Universal Auto-healing
    if (searchQuery && filteredPackages.length === 0 && !loading && !isGenerating) {
      const timer = setTimeout(async () => {
        setIsGenerating(true);
        try {
          const currentQuery = searchQuery.trim();
          const result = await api.searchPackage(searchQuery);
          if (result?.success && result.data) {
            const healedPackage = {
              ...result.data,
              aiSearchQuery: currentQuery,
            };

            setPackages(prev => {
              const healedId = String(healedPackage._id || '');
              const withoutDuplicate = prev.filter(pkg => String(pkg._id || '') !== healedId);
              return dedupeByPlace([healedPackage, ...withoutDuplicate]);
            });
            setTotalPages(1);
            setTotalResults(1);
          }
        } catch (error) {
          console.error("AI Generation error:", error);
        } finally {
          setIsGenerating(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filteredPackages.length, loading, fetchPackages, isGenerating]);

  const updateParams = (newParams, shouldScroll = true) => {
    const current = Object.fromEntries([...searchParams]);
    const merged = { ...current, ...newParams };

    // Cleanup empty params
    Object.keys(merged).forEach(key => {
      if (!merged[key] || merged[key] === 'All') {
        delete merged[key];
      }
    });

    setSearchParams(merged);
    if (shouldScroll) {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const handleCategoryChange = (catId) => {
    updateParams({ category: catId, page: 1 });
  };

  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value, page: 1 });
  };

  const handleSearchChange = (value) => {
    updateParams({ search: value, page: 1 }, false);
  };

  const handleSearchSubmit = (value = searchQuery) => {
    updateParams({ search: value.trim(), page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
  };

  const handleGroupTypeToggle = (type) => {
    let newTypes = [...groupTypes];
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type);
    } else {
      newTypes.push(type);
    }
    updateParams({ groupType: newTypes.join(','), page: 1 });
  };

  const handleFilterChange = (key, value) => {
    updateParams({ [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setSearchParams({});
    setIsEcoOnly(false);
    setIsLuxuryOnly(false);
    setIsTrendingOnly(false);
  };

  return (
    <div className="packages-page">
      {particlesInit && (
        <Particles
          id="tsparticles"
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            particles: {
              color: { value: "#ff7e5f" },
              links: { color: "#ff7e5f", distance: 150, enable: true, opacity: 0.2, width: 1 },
              move: { enable: true, speed: 1 },
              number: { density: { enable: true, area: 800 }, value: 40 },
              opacity: { value: 0.3 },
              size: { value: { min: 1, max: 3 } },
            },
          }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '500px', zIndex: 1 }}
        />
      )}

      {/* Premium Hero Section */}
      <div className="pkg-hero">
        <div className="pkg-hero-overlay"></div>
        <div className="container relative z-10">
          <motion.div
            className="pkg-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="pkg-hero-badge">
              <FaMagic className="mr-2 inline" /> Handpicked Experiences
            </div>
            <h1>Premium <span>Tour Packages</span></h1>
            <p>
              Explore our curated collection of luxury tours and adventure packages
              designed for travelers who seek the extraordinary.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Sticky Category Chips & Search */}
      <div className="pkg-controls-sticky">
        <div className="container">
          <div className="pkg-controls-wrapper">
            <div className="category-scroll-container">
              <div className="category-nav">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-name">{cat.name}</span>
                    {activeCategory === cat.id && (
                      <motion.div
                        className="cat-active-line"
                        layoutId="activeTabPkg"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-sort-group pkg-search-sort-group">
              <div className="dest-search-box pkg-search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(searchQuery);
                    }
                  }}
                  className="destinations-search-input packages-search-input"
                />
              </div>
              <div className="dest-sort-box pkg-sort-box">
                <FaSortAmountDown className="sort-icon" />
                <select value={sort} onChange={handleSortChange}>
                  <option value="popularity">Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container section pkg-layout">

        {/* Mobile Filter Toggle */}
        <button className="mobile-filter-btn" onClick={() => setSidebarOpen(true)}>
          <FaFilter /> Filters
        </button>

        {/* Filter Sidebar */}
        <div className={`pkg-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header mobile-only">
            <h3>Filters</h3>
            <button onClick={() => setSidebarOpen(false)}><FaTimes /></button>
          </div>

          <div className="sidebar-content">
            <div className="filter-group">
              <h4>Quick Access</h4>
              <div className="quick-access-links">
                <button onClick={clearFilters} className="link-btn">Reset All</button>
                <button onClick={() => updateParams({ sort: 'newest' })} className="link-btn">New Arrivals</button>
              </div>
            </div>

            <div className="filter-group">
              <h4>Comfort Level</h4>
              <select value={comfortLevelParam} onChange={(e) => handleFilterChange('comfortLevel', e.target.value)} className="w-full filter-select">
                <option value="">Any Comfort</option>
                {COMFORT_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h4>Month of Travel</h4>
              <select value={monthParam} onChange={(e) => handleFilterChange('month', e.target.value)} className="w-full filter-select">
                <option value="">Any Month</option>
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-inputs">
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
                <span>-</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <h4>Group Type</h4>
              <div className="checkbox-list">
                {GROUP_TYPES.map(type => (
                  <label key={type} className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={groupTypes.includes(type)}
                      onChange={() => handleGroupTypeToggle(type)}
                    />
                    <span className="checkmark"></span>
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Duration</h4>
              <select value={durationParam} onChange={(e) => handleFilterChange('duration', e.target.value)} className="w-full filter-select">
                <option value="">Any Duration</option>
                {DURATIONS.map(dur => (
                  <option key={dur.value} value={dur.value}>{dur.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <h4>Minimum Rating</h4>
              <select value={ratingParam} onChange={(e) => handleFilterChange('rating', e.target.value)} className="w-full filter-select">
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="pkg-main">
          <div className="pkg-main-header">
            <div className="pkg-sort-row">
              <div className="pkg-quick-filters">
                <button
                  className={`quick-filter-btn ${isEcoOnly ? 'active' : ''}`}
                  onClick={() => {
                    const next = !isEcoOnly;
                    setIsEcoOnly(next);
                    handleFilterChange('isEcoFriendly', next ? 'true' : '');
                  }}
                >
                  🍃 Eco-friendly
                </button>
                <button
                  className={`quick-filter-btn ${isLuxuryOnly ? 'active' : ''}`}
                  onClick={() => {
                    const next = !isLuxuryOnly;
                    setIsLuxuryOnly(next);
                    handleFilterChange('comfortLevel', next ? 'Luxury' : '');
                  }}
                >
                  💎 Luxury
                </button>
                <button
                  className={`quick-filter-btn ${isTrendingOnly ? 'active' : ''}`}
                  onClick={() => {
                    const next = !isTrendingOnly;
                    setIsTrendingOnly(next);
                    handleFilterChange('isTrending', next ? 'true' : '');
                  }}
                >
                  🔥 Trending
                </button>
              </div>

              <div className="pkg-view-toggle">
                <button
                  className={viewType === 'grid' ? 'active' : ''}
                  onClick={() => setViewType('grid')}
                  title="Grid View"
                >
                  <FaThLarge />
                </button>
                <button
                  className={viewType === 'list' ? 'active' : ''}
                  onClick={() => setViewType('list')}
                  title="List View"
                >
                  <FaList />
                </button>
              </div>
            </div>

            <div className="search-info">
              {loading ? (
                <p>Loading results...</p>
              ) : (
                <p>Showing <strong>{filteredPackages.length}</strong> {filteredPackages.length === 1 ? 'package' : 'packages'}</p>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                className="cards-grid-3x3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  layout
                  className={`pkg-cards-container ${viewType}`}
                >
                  {filteredPackages.length > 0 ? (
                    filteredPackages.map((pkg, index) => (
                      <motion.div
                        layout
                        key={pkg._id || index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <PackageCard {...pkg} viewType={viewType} />
                      </motion.div>
                    ))
                  ) : isGenerating ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="no-results healer-active"
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <div className="generating-icon">
                        <FaMagic className="animate-spin text-primary" />
                      </div>
                      <h3>AI Auto-Healing Active</h3>
                      <p>
                        We couldn't find a direct match, so our AI is generating a custom
                        premium itinerary for <strong>"{searchQuery}"</strong> just for you.
                      </p>
                      <div className="healing-progress-bar">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="no-results"
                      style={{ gridColumn: '1 / -1' }}
                    >
                      <div className="empty-icon">
                        <FaRoute />
                      </div>
                      <h3>No packages found</h3>
                      <p>We couldn't find any packages matching your search or filters. Try a different keyword or clear filters.</p>
                      <button className="btn-primary mt-4" onClick={clearFilters}>View All Packages</button>
                    </motion.div>
                  )}
                </motion.div>

                {page < totalPages && filteredPackages.length > 0 && (
                  <div className="load-more-container">
                    <button
                      className="load-more-btn"
                      onClick={() => fetchPackages(true)}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More Packages'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Packages;
