import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { HotelCard } from '../components/HotelCard';
import { CardSkeleton } from '../components/Skeleton';
import { hotelService } from '../services/hotelService';
import { FaMapMarkedAlt, FaFilter } from 'react-icons/fa';
import Pagination from '../components/common/Pagination';
import { matchesSearchFields } from '../utils/search';
import hotelHeroTravelers from '../assets/hotel-hero-travelers.png';

const Hotels = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [destination, setDestination] = useState(searchParams.get('destination') || searchParams.get('q') || '');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('2 Adults, 1 Room');
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('Popularity');
  const [priceRange, setPriceRange] = useState([12000, 64000]);
  const [selectedStars, setSelectedStars] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const amenitiesList = ["Free WiFi", "Swimming Pool", "Fitness Center", "Spa & Wellness", "Restaurant"];

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await hotelService.getHotels({
        destination,
        minPrice: priceRange[0] > 12000 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 64000 ? priceRange[1] : undefined,
        stars: selectedStars,
        amenities: selectedAmenities
      });
      setHotels(data);
      setCurrentPage(1); // Reset to first page on new fetch
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    } finally {
      setLoading(false);
    }
  }, [destination, priceRange, selectedStars, selectedAmenities]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]); // Run on mount and whenever fetchHotels changes

  useEffect(() => {
    setDestination(searchParams.get('destination') || searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (destination.trim()) params.set('destination', destination.trim());
    else params.delete('destination');
    params.delete('q');
    navigate({ search: params.toString() }, { replace: true });
    fetchHotels();
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Derived state for pagination
  const filteredHotels = useMemo(() => {
    const query = destination.trim();
    if (!query) return hotels;

    return hotels.filter((hotel) =>
      matchesSearchFields(hotel, query, [
        'name',
        'location',
        'city',
        'description',
        'rating',
        (item) => (item.amenities || []).join(' '),
        (item) => item.pricePerNight || item.price,
      ])
    );
  }, [hotels, destination]);

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const paginatedHotels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHotels.slice(start, start + itemsPerPage);
  }, [filteredHotels, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Smooth scroll to top of results
    const resultsElement = document.getElementById('results-grid');
    if (resultsElement) {
      const offset = 100; // Offset for header/navbar
      const elementPosition = resultsElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0a0a0a] min-h-screen pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 px-6 pb-52 pt-32 lg:px-10">
        {/* Abstract Background Shapes */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-25">
          <div className="absolute -right-[10%] -top-[20%] h-[80%] w-[60%] rounded-full bg-indigo-500 blur-[120px]"></div>
          <div className="absolute -left-[10%] top-[40%] h-[60%] w-[50%] rounded-full bg-purple-600 blur-[100px]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px]">
          <div className="grid min-h-[470px] items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <span className="mb-5 inline-flex rounded-full border border-purple-300/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-100 backdrop-blur">
                Curated stays
              </span>
              <h1 className="max-w-[760px] text-5xl font-black leading-[0.98] tracking-tight text-white md:text-6xl xl:text-7xl">
                Find Your <span className="text-purple-300">Perfect</span> Stay
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-gray-300 md:text-xl">
                Compare handpicked hotels, verified comfort, and smooth booking for every kind of trip.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative hidden min-h-[470px] lg:block"
              aria-hidden="true"
            >
              <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-purple-400/25 blur-[90px]" />
              <div className="absolute bottom-0 right-8 h-56 w-56 rounded-full bg-blue-400/20 blur-[70px]" />
              <img
                src={hotelHeroTravelers}
                alt=""
                className="absolute bottom-[-98px] right-[-16px] z-10 h-[560px] w-auto object-contain drop-shadow-[0_32px_45px_rgba(2,6,23,0.45)] xl:h-[600px]"
              />
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSearch}
            className="relative top-10 z-20 flex w-full flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl dark:border-zinc-800 dark:bg-[#1e1e1e] md:flex-row md:rounded-full md:p-4"
          >
            <div className="flex-1 w-full md:w-auto px-4 py-2 md:border-r border-gray-200 dark:border-zinc-700">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Destination</label>
              <input
                type="text"
                placeholder="Search hotels, city, or destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white font-semibold text-[15px] placeholder-gray-300 dark:placeholder-zinc-600 focus:ring-0 p-0"
              />
            </div>

            <div className="flex-1 w-full md:w-auto px-4 py-2 md:border-r border-gray-200 dark:border-zinc-700">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Check In - Out</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  aria-label="Check in date"
                  value={checkInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    const nextDate = e.target.value;
                    setCheckInDate(nextDate);
                    if (checkOutDate && nextDate > checkOutDate) {
                      setCheckOutDate(nextDate);
                    }
                  }}
                  className="hotel-date-input w-full bg-transparent border-none outline-none text-gray-900 dark:text-white font-semibold text-[15px] placeholder-gray-300 dark:placeholder-zinc-600 focus:ring-0 p-0"
                />
                <input
                  type="date"
                  aria-label="Check out date"
                  value={checkOutDate}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="hotel-date-input w-full bg-transparent border-none outline-none text-gray-900 dark:text-white font-semibold text-[15px] placeholder-gray-300 dark:placeholder-zinc-600 focus:ring-0 p-0"
                />
              </div>
            </div>

            <div className="flex-1 w-full md:w-auto px-4 py-2">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Guests</label>
              <input
                type="text"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white font-semibold text-[15px] placeholder-gray-400 focus:ring-0 p-0"
              />
            </div>

            <button type="submit" className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all flex-[0.5]">
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 mt-20 pt-10">
        
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Results ({filteredHotels.length})</h2>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm font-semibold"
          >
            <FaFilter /> Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm sticky top-28">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold dark:text-white">Filters</h3>
                <button 
                  onClick={() => { setPriceRange([12000, 64000]); setSelectedStars(0); setSelectedAmenities([]); }}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset
                </button>
              </div>

              {/* Sort */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white rounded-xl py-3 px-4 outline-none font-medium appearance-none cursor-pointer"
                >
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                </select>
              </div>

              {/* Price Range (UI Mockup for Slider) */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price Range</label>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                </div>
                <input 
                  type="range" min="4000" max="120000" step="500" 
                  value={priceRange[1]} 
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Star Rating */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Star Rating</label>
                <div className="flex gap-2">
                  {[5, 4, 3, 2].map(star => (
                    <button 
                      key={star}
                      onClick={() => setSelectedStars(selectedStars === star ? 0 : star)}
                      className={`w-12 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors border ${
                        selectedStars === star 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                        : 'bg-white dark:bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-blue-500'
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-10">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Amenities</label>
                <div className="space-y-3">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleAmenity(amenity)}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        selectedAmenities.includes(amenity)
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-transparent border-gray-300 dark:border-zinc-600 group-hover:border-blue-500'
                      }`}>
                        {selectedAmenities.includes(amenity) && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-[15px] text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full py-3.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  Show {filteredHotels.length} Results
              </button>
            </div>
          </aside>

          {/* Right Main Grid */}
          <div className="flex-1" id="results-grid">
            <div className="flex justify-between items-end mb-8 hidden lg:flex">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white capitalize">
                  {destination ? `Stays in ${destination}` : 'Discover Global Stays'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Found {filteredHotels.length} properties matching your criteria</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-zinc-800 rounded-full font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md transition-all hover:text-blue-600 dark:hover:text-blue-400">
                <FaMapMarkedAlt /> View Map
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#1e1e1e] rounded-3xl border border-gray-100 dark:border-zinc-800">
                <h3 className="text-2xl font-bold dark:text-white mb-2">No hotels found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or destination.</p>
                <button 
                  onClick={() => { setDestination(''); setPriceRange([12000, 64000]); setSelectedStars(0); setSelectedAmenities([]); }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedHotels.map((hotel) => (
                    <HotelCard key={hotel.id} {...hotel} />
                  ))}
                </div>
                
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Hotels;
