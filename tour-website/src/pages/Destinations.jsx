import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCompass, FaUmbrellaBeach, FaMountain, FaHiking, FaPray, FaHistory, FaHeart, FaPaw, FaCity, FaSun, FaGlobe, FaSearch, FaArrowRight, FaMagic, FaSortAmountDown } from 'react-icons/fa';
import SearchBar from '../components/common/SearchBar';
import { PackageCard, DestinationCard } from '../components/Cards';
import { CardSkeleton } from '../components/Skeleton';
import Pagination from '../components/common/Pagination';
import { api } from '../services/api';
import { matchesSearchFields } from '../utils/search';
import { slugify } from '../utils/destinationDetails';
import toast from 'react-hot-toast';
import './Destinations.css';

const ITEMS_PER_PAGE = 6;
const CATEGORY_CARDS_PER_PAGE = 3;

const normalizeCardKey = (value = '') => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ');

const dedupeByPlace = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeCardKey(item?.name || item?.title || item?.location || item?._id || item?.id);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const CATEGORIES = [
  { id: 'All', name: 'All', icon: <FaCompass /> },
  { id: 'Beach', name: 'Beach', icon: <FaUmbrellaBeach />, description: 'Sun, sand, and crystal clear waters.' },
  { id: 'Mountain', name: 'Mountain', icon: <FaMountain />, description: 'Majestic peaks and breathtaking views.' },
  { id: 'Adventure', name: 'Adventure', icon: <FaHiking />, description: 'Thrill-seeking experiences for the brave.' },
  { id: 'Spiritual', name: 'Spiritual', icon: <FaPray />, description: 'Find inner peace at sacred destinations.' },
  { id: 'Historical', name: 'Historical', icon: <FaHistory />, description: 'Journey through time and heritage.' },
  { id: 'Honeymoon', name: 'Honeymoon', icon: <FaHeart />, description: 'Romantic getaways for your special moments.' },
  { id: 'Wildlife', name: 'Wildlife', icon: <FaPaw />, description: 'Encounter nature in its purest form.' },
  { id: 'City', name: 'City', icon: <FaCity />, description: 'Vibrant urban life and modern wonders.' },
  { id: 'Desert', name: 'Desert', icon: <FaSun />, description: 'Golden dunes and enchanting sunsets.' },
  { id: 'Island', name: 'Island', icon: <FaGlobe />, description: 'Tropical paradises and hidden gems.' },
];

const Destinations = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Refs to hold latest state for stable callbacks (avoids circular effect loops)
  const isSearchingRef = useRef(false);
  const generatedResultRef = useRef(null);
  const destinationsRef = useRef([]);

  // Keep refs in sync with state
  useEffect(() => { isSearchingRef.current = isSearching; }, [isSearching]);
  useEffect(() => { generatedResultRef.current = generatedResult; }, [generatedResult]);
  useEffect(() => { destinationsRef.current = destinations; }, [destinations]);

  // 1. Initial data fetch
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const data = await api.getDestinations();
        setDestinations(dedupeByPlace(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error('Failed to load destinations:', err);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  // 2. Sync input value with URL param ONLY when the URL param itself changes.
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // 3. Stable AI-search trigger — uses refs so the function identity never changes.
  const triggerAISearch = useCallback(async (query) => {
    if (isSearchingRef.current) return;
    setIsSearching(true);
    isSearchingRef.current = true;

    if (generatedResultRef.current?.generatedForQuery !== query.toLowerCase()) {
      setGeneratedResult(null);
      generatedResultRef.current = null;
    }

    try {
      const response = await api.aiSearchDestination(query);
      if (response && response.success && response.data) {
        const destData = response.data;
        const virtualCard = {
          ...destData,
          packageId: destData.packageId || response.packageId, // Support both formats just in case
          isDynamic: true,
          isNewGeneration: response.isNew,
          generatedForQuery: query.toLowerCase()
        };
        setGeneratedResult(virtualCard);
        generatedResultRef.current = virtualCard;
      } else {
        setGeneratedResult(null);
        generatedResultRef.current = null;
        toast.error("Could not generate a destination package for this place.");
      }
    } catch (err) {
      console.error('Dynamic search failed:', err);
      toast.error(err.message || "Failed to discover new destinations.");
      setGeneratedResult(null);
      generatedResultRef.current = null;
    } finally {
      setIsSearching(false);
      isSearchingRef.current = false;
    }
  }, []);

  // 4. React to URL param changes: reset result when cleared, trigger AI when no local match
  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) {
      setGeneratedResult(null);
      generatedResultRef.current = null;
      return;
    }

    const queryLower = q.toLowerCase().trim();
    if (!queryLower) return;

    setActiveCategory('All');

    if (!loading) {
      const hasLocalMatch = destinationsRef.current.some(d => {
        const name = (d.name || d.title || '').toLowerCase();
        const location = (d.location || '').toLowerCase();
        return name.includes(queryLower) || location.includes(queryLower);
      });

      const currentResult = generatedResultRef.current;
      const isCurrentMatch = currentResult && currentResult.generatedForQuery === queryLower;

      if (!hasLocalMatch && !isCurrentMatch && !isSearchingRef.current) {
        triggerAISearch(q);
      }
    }
  }, [searchParams, loading, triggerAISearch]);

  // Reset to first page when search/category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const filteredAndSortedDestinations = useMemo(() => {
    let list = [...destinations];

    // Prioritize and Merge dynamic result if it exists and matches the search query
    if (generatedResult && searchQuery) {
      const queryLower = searchQuery.toLowerCase().trim();

      if (generatedResult.generatedForQuery === queryLower) {
        const isAlreadyInList = list.some(d =>
          d._id === generatedResult._id ||
          (d.name && generatedResult.name && d.name.toLowerCase() === generatedResult.name.toLowerCase())
        );
        if (!isAlreadyInList) {
          list = [generatedResult, ...list];
        }
      }
    }

    let filtered = dedupeByPlace(list);

    // Search filter (Local + Dynamic)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(d => {
        if (!d) return false;
        if (d.generatedForQuery === query) return true; // Always include the exact AI result
        return matchesSearchFields(d, query, [
          'name',
          'title',
          'location',
          'type',
          'category',
          'description',
          'tags',
          'budget',
        ]);
      });
    }

    // Category filter (if not "All")
    if (activeCategory !== 'All') {
      filtered = filtered.filter(d => (d.type === activeCategory || d.category === activeCategory));
    }

    // Sorting
    switch (sortBy) {
      case 'priceLow':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'priceHigh':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      default: // featured or newest
        filtered.sort((a, b) => {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    }

    return dedupeByPlace(filtered);
  }, [destinations, activeCategory, searchQuery, sortBy, generatedResult]);

  const handleSearch = (overrideQuery) => {
    const query = (typeof overrideQuery === 'string' ? overrideQuery : searchQuery).trim();
    if (!query) {
      setSearchParams({});
      setGeneratedResult(null);
      generatedResultRef.current = null;
      return;
    }

    // Update URL - the useEffect will handle the rest
    setSearchParams({ q: query });
    if (activeCategory !== 'All') setActiveCategory('All');
  };

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return destinations.filter(d => matchesSearchFields(d, searchQuery, [
      'name',
      'title',
      'location',
      'category',
      'type',
      'description',
    ])).slice(0, 5);
  }, [destinations, searchQuery]);

  const isGroupedAllView = activeCategory === 'All' && searchQuery.trim() === '';

  // Pagination logic
  const totalPages = useMemo(() => {
    if (!isGroupedAllView) {
      return Math.ceil(filteredAndSortedDestinations.length / ITEMS_PER_PAGE);
    }

    const categoryPages = CATEGORIES.slice(1).map((cat) => {
      const categoryItems = filteredAndSortedDestinations.filter(
        (d) => d.type === cat.id || d.category === cat.id
      );
      return Math.ceil(categoryItems.length / CATEGORY_CARDS_PER_PAGE);
    });

    return Math.max(1, ...categoryPages);
  }, [filteredAndSortedDestinations, isGroupedAllView]);

  const paginatedDestinations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedDestinations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedDestinations, currentPage]);

  const groupedDestinations = useMemo(() => {
    if (!isGroupedAllView) return [];

    const startIndex = (currentPage - 1) * CATEGORY_CARDS_PER_PAGE;
    const endIndex = startIndex + CATEGORY_CARDS_PER_PAGE;

    return CATEGORIES.slice(1)
      .map((cat) => {
        const categoryItems = filteredAndSortedDestinations.filter(
          (d) => d.type === cat.id || d.category === cat.id
        );

        return {
          ...cat,
          items: categoryItems.slice(startIndex, endIndex),
        };
      })
      .filter((group) => group.items.length > 0);
  }, [filteredAndSortedDestinations, currentPage, isGroupedAllView]);

  useEffect(() => {
    if (totalPages <= 0) return;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openDestination = useCallback((dest) => {
    if (!dest) return;

    if (dest.isDynamic || (!dest._id && !dest.id)) {
      const query = dest.generatedForQuery || searchQuery || dest.name || dest.title || dest.location || 'destination';
      const slug = slugify(query);
      navigate(`/dynamic-destination/${encodeURIComponent(slug)}?q=${encodeURIComponent(query)}`);
      return;
    }

    navigate(`/destination/${dest._id || dest.id}`);
  }, [navigate, searchQuery]);

  return (
    <div className="destinations-page-upgrade">
      {/* Hero Section */}
      <section className="dest-hero">
        <div className="dest-hero-overlay"></div>
        <motion.div
          className="container dest-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span className="dest-hero-badge">Discover Your World</motion.span>
          <h1>Explore Destinations <br /><span>By Category</span></h1>
          <p>Handpicked escapes for every type of traveler. From tranquil beaches to majestic mountains.</p>
        </motion.div>
      </section>

      {/* Control Bar */}
      <div className="dest-controls-sticky">
        <div className="container">
          <div className="dest-controls-wrapper">
            {/* Category Filter Bar */}
            <div className="category-scroll-container">
              <div className="category-nav">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-name">{cat.name}</span>
                    {activeCategory === cat.id && (
                      <motion.div
                        className="cat-active-line"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Sort */}
            <div className="search-sort-group">
              <div className="dest-search-box">
                <FaSearch className="dest-search-legacy-icon" />
                <input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>
              <div className="dest-sort-box">
                <FaSortAmountDown className="sort-icon" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Popularity</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container dest-main-content">
        {loading ? (
          <div className="cards-grid-3x3">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeCategory === 'All' ? (
              <motion.div
                key="all-categories"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {searchQuery.trim() !== '' ? (
                  <section className="category-section">
                    <div className="search-results-header">
                      <div className="search-header-main">
                        <h2>{`Search Results for "${searchQuery}"`}</h2>
                        {isSearching && (
                          <div className="inline-searching-loader">
                            <div className="mini-spinner"></div>
                            <span>Searching for perfect matches...</span>
                          </div>
                        )}
                      </div>
                      <span className="results-count">
                        {filteredAndSortedDestinations.length} {filteredAndSortedDestinations.length === 1 ? 'destination' : 'destinations'} found
                      </span>
                    </div>

                    <div className="cards-grid-3x3">
                      {paginatedDestinations.map(dest => (
                        <DestinationCard
                          key={dest._id || dest.id || dest.generatedForQuery || dest.name || dest.title}
                          {...dest}
                          onClick={() => openDestination(dest)}
                        />
                      ))}

                      {isSearching && paginatedDestinations.length === 0 && (
                        [1, 2, 3].map(i => <CardSkeleton key={`searching-skeleton-${i}`} />)
                      )}
                    </div>

                    {!isSearching && paginatedDestinations.length === 0 && (
                      <div className="no-results">
                        <FaSearch size={40} style={{ marginBottom: '20px', opacity: 0.3 }} />
                        <h3>{`No results found for "${searchQuery}"`}</h3>
                        <p>We couldn't find any matching places in our database.</p>
                        <button onClick={() => handleSearch()} className="btn btn-primary" style={{ marginTop: '20px' }}>
                          Try Searching Again
                        </button>
                      </div>
                    )}
                  </section>
                ) : (
                  <>
                    {groupedDestinations.map((group) => (
                      <section key={group.id} className="category-section">
                        <div className="category-header">
                          <div className="cat-title-group">
                            <h2>{group.name} Destinations</h2>
                            <p>{group.description}</p>
                          </div>
                          <div className="cat-header-line"></div>
                        </div>
                        <div className="cards-grid-3x3">
                          {group.items.map(dest => (
                            <DestinationCard
                              key={dest._id || dest.id || dest.generatedForQuery || dest.name || dest.title}
                              {...dest}
                              onClick={() => openDestination(dest)}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                    {groupedDestinations.length === 0 && (
                      <div className="no-results">
                        <FaSearch size={40} style={{ marginBottom: '20px', opacity: 0.3 }} />
                        <h3>Discover amazing places</h3>
                        <p>Browse categories or use the search bar to find your next adventure.</p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="category-header single-view">
                  <h2>{activeCategory} Getaways</h2>
                  <p>{CATEGORIES.find(c => c.id === activeCategory)?.description || "Explore our handpicked selection."}</p>
                </div>
                <div className="cards-grid-3x3">
                  {paginatedDestinations.map(dest => (
                    <DestinationCard
                      key={dest._id || dest.id || dest.generatedForQuery || dest.name || dest.title}
                      {...dest}
                      onClick={() => openDestination(dest)}
                    />
                  ))}
                </div>
                {paginatedDestinations.length === 0 && (
                  <div className="no-results-found">
                    <p>No destinations found for this selection.</p>
                    <button
                      onClick={() => { setActiveCategory('All'); setSearchQuery(''); setSearchParams({}); }}
                      className="reset-filters-btn"
                    >
                      Explore All Destinations
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Pagination Section */}
        {!loading && totalPages > 1 && (
          <div style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 450, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
