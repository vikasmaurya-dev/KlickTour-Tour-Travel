import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaBed,
  FaCalendarAlt,
  FaCamera,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaConciergeBell,
  FaHeart,
  FaInfoCircle,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaParking,
  FaPlane,
  FaQuoteLeft,
  FaRegHeart,
  FaRegStar,
  FaShieldAlt,
  FaSpa,
  FaStar,
  FaSwimmingPool,
  FaTrain,
  FaUsers,
  FaUtensils,
  FaWifi,
  FaExpand,
  FaChevronDown,
  FaRegCheckCircle,
} from 'react-icons/fa';
import SelfHealingImage from '../common/SelfHealingImage';
import { buildHotelRatingBreakdown } from '../../utils/hotelDetails';

const uniqueStrings = (values = []) => {
  const seen = new Set();
  return values.filter(Boolean).filter((value) => {
    const next = String(value).trim();
    if (!next || seen.has(next)) return false;
    seen.add(next);
    return true;
  });
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const toDateInput = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const addDays = (base, days) => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

const diffNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return 1;
  const diff = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
};

const amenityIcons = {
  'Free WiFi': <FaWifi />,
  WiFi: <FaWifi />,
  Pool: <FaSwimmingPool />,
  Swimming: <FaSwimmingPool />,
  Spa: <FaSpa />,
  Restaurant: <FaUtensils />,
  'Room Service': <FaConciergeBell />,
  Parking: <FaParking />,
  Concierge: <FaConciergeBell />,
  Bed: <FaBed />,
  'Airport Transfer': <FaPlane />,
  'Travel Desk': <FaPlane />,
};

const roomFacilityIcon = (label) => {
  const key = String(label || '').toLowerCase();
  if (key.includes('wifi')) return <FaWifi />;
  if (key.includes('pool')) return <FaSwimmingPool />;
  if (key.includes('spa')) return <FaSpa />;
  if (key.includes('park')) return <FaParking />;
  if (key.includes('airport') || key.includes('transfer')) return <FaPlane />;
  if (key.includes('restaurant') || key.includes('dining') || key.includes('breakfast')) return <FaUtensils />;
  if (key.includes('concierge') || key.includes('service')) return <FaConciergeBell />;
  return <FaRegCheckCircle />;
};

const StatChip = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  </div>
);

const SectionHeader = ({ eyebrow, title, description }) => (
  <div className="mb-6">
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/80">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">{title}</h2>
    {description && <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{description}</p>}
  </div>
);

const HotelDetailsTemplate = ({
  hotel,
  reviewsData,
  similarHotels = [],
  wishlistSaved = false,
  onToggleWishlist,
}) => {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(hotel.heroImage);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(hotel.rooms?.[0]?.id || hotel.rooms?.[0]?._id || '');
  const [checkIn, setCheckIn] = useState(() => toDateInput(addDays(new Date(), 1)));
  const [checkOut, setCheckOut] = useState(() => toDateInput(addDays(new Date(), 3)));
  const [guests, setGuests] = useState(2);

  const galleryImages = useMemo(
    () => uniqueStrings([activeImage, ...(hotel.gallery || []), ...(hotel.imagePool || [])]).slice(0, 8),
    [activeImage, hotel.gallery, hotel.imagePool]
  );

  const roomOptions = hotel.rooms || [];
  const selectedRoom = roomOptions.find((room) => String(room.id || room._id) === String(selectedRoomId))
    || roomOptions[0]
    || null;

  const nights = diffNights(checkIn, checkOut);
  const roomRate = Number(selectedRoom?.price || hotel.pricePerNight || 0);
  const roomSubtotal = roomRate * nights;
  const taxes = Math.round(roomSubtotal * 0.12);
  const extraGuestCharge = Math.max(0, Number(guests || 1) - 2) * 750 * nights;
  const total = roomSubtotal + taxes + extraGuestCharge;

  const ratingBreakdown = buildHotelRatingBreakdown(reviewsData?.reviews || [], hotel.rating);
  const recentReviews = (reviewsData?.reviews || []).slice(0, 4);
  const averageRating = Number(reviewsData?.averageRating || hotel.rating || 4.5);
  const reviewCount = Number(reviewsData?.count || hotel.reviewsCount || 0);

  const handleBookNow = () => {
    const params = new URLSearchParams();
    if (selectedRoom?.id || selectedRoom?._id) params.set('room', String(selectedRoom.id || selectedRoom._id));
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', String(guests));
    params.set('nights', String(nights));
    navigate(`/hotels/${hotel.id}/book?${params.toString()}`);
  };

  const toggleWishlist = () => {
    if (onToggleWishlist) onToggleWishlist();
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <SelfHealingImage
            src={hotel.heroImage}
            alt={`${hotel.name} | ${hotel.location}`}
            entityId={hotel.id}
            type="hotel"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#050816]/60 to-[#050816]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_24%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pb-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/hotels')}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-xl transition hover:bg-white/10"
            >
              <FaArrowLeft />
              Back to hotels
            </button>

            <button
              onClick={toggleWishlist}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition ${
                wishlistSaved
                  ? 'border-rose-400/40 bg-rose-500/20 text-rose-300'
                  : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
              aria-label="Wishlist"
            >
              {wishlistSaved ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/15 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200">
                  {hotel.categoryLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-xl">
                  <FaMapMarkerAlt className="text-cyan-300" />
                  {hotel.location}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-xl">
                  <FaStar className="text-amber-300" />
                  {averageRating.toFixed(1)} ({reviewCount} reviews)
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-xl">
                  Starting from ₹{formatCurrency(hotel.pricePerNight)}
                </span>
              </div>

              <div className="max-w-4xl">
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-cyan-200/75">Hotel Experience</p>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {hotel.name}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200/90 sm:text-lg">
                  {hotel.tagline || hotel.overview}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatChip icon={<FaClock />} label="Check-in" value="2:00 PM" />
                <StatChip icon={<FaClock />} label="Check-out" value="11:00 AM" />
                <StatChip icon={<FaBed />} label="Room options" value={`${roomOptions.length} categories`} />
                <StatChip icon={<FaMapMarkerAlt />} label="Location" value={hotel.location} />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Starting from</p>
                  <div className="mt-2 text-3xl font-black text-white">₹{formatCurrency(hotel.pricePerNight)}</div>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">Guest Score</p>
                  <div className="mt-1 flex items-center gap-1 text-sm font-bold text-cyan-100">
                    <FaStar className="text-amber-300" />
                    {averageRating.toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Type</p>
                  <p className="mt-1 text-sm font-bold text-white">{hotel.style === 'luxury' ? 'Luxury Stay' : hotel.categoryLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Reviews</p>
                  <p className="mt-1 text-sm font-bold text-white">{reviewCount} verified stays</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {galleryImages.slice(0, 4).map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`group relative h-24 overflow-hidden rounded-2xl border transition ${
                      activeImage === img ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-white/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SelfHealingImage
                      src={img}
                      alt={`${hotel.name} gallery ${idx + 1}`}
                      entityId={hotel.id}
                      type="hotel"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setGalleryOpen(true)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                <FaCamera />
                View all {galleryImages.length} photos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-10">
          <div className="space-y-8">
            {/* Overview */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-8"
            >
              <SectionHeader
                eyebrow="Overview"
                title="Hotel overview and description"
                description={hotel.overview}
              />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatChip icon={<FaUsers />} label="Best for" value={hotel.style === 'family' ? 'Family stays' : 'Couples and premium travelers'} />
                <StatChip icon={<FaCheckCircle />} label="Stay style" value={hotel.categoryLabel} />
                <StatChip icon={<FaMapMarkerAlt />} label="Address" value={hotel.addressLine} />
                <StatChip icon={<FaShieldAlt />} label="Experience" value={hotel.reviewScoreLabel} />
              </div>
            </motion.section>

            {/* Gallery */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-8"
            >
              <SectionHeader
                eyebrow="Gallery"
                title="Large hotel banner image and gallery"
                description="Browse the property, rooms, and visual highlights before booking."
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {galleryImages.map((image, idx) => (
                  <button
                    key={`${image}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 aspect-[4/3]"
                  >
                    <SelfHealingImage
                      src={image}
                      alt={`${hotel.name} gallery ${idx + 1}`}
                      entityId={hotel.id}
                      type="hotel"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-60 transition group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      <FaExpand />
                      View
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>

            {/* Room options */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-8"
            >
              <SectionHeader
                eyebrow="Rooms"
                title="Room options"
                description="Select the room that fits your style, guests, and nightly budget."
              />

              <div className="space-y-4">
                {roomOptions.map((room, idx) => {
                  const isActive = String(room.id || room._id) === String(selectedRoomId);
                  return (
                    <div
                      key={room.id || room._id || idx}
                      className={`overflow-hidden rounded-[1.8rem] border transition ${
                        isActive ? 'border-cyan-400/50 bg-cyan-400/10 shadow-[0_10px_40px_rgba(14,165,233,0.12)]' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="grid gap-5 p-4 md:grid-cols-[180px_minmax(0,1fr)_180px] md:p-5">
                        <button
                          type="button"
                          onClick={() => setActiveImage(room.image || hotel.heroImage)}
                          className="relative h-44 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20"
                        >
                          <SelfHealingImage
                            src={room.image || hotel.heroImage}
                            alt={`${room.roomType} | ${hotel.name}`}
                            entityId={hotel.id}
                            type="hotel"
                            className="h-full w-full object-cover"
                          />
                        </button>

                        <div className="space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-black tracking-tight text-white">{room.roomType}</h3>
                            {room.featured && (
                              <span className="rounded-md border border-amber-300/30 bg-amber-300/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200">
                                Popular choice
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                            <span className="inline-flex items-center gap-2">
                              <FaUsers className="text-cyan-300" />
                              {room.capacity}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <FaBed className="text-cyan-300" />
                              {room.available !== false ? 'Available today' : 'Request on arrival'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {uniqueStrings(room.facilities || []).slice(0, 4).map((facility) => (
                              <span
                                key={facility}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-slate-200"
                              >
                                {roomFacilityIcon(facility)}
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-4 border-t border-white/10 pt-4 md:flex-col md:items-end md:justify-between md:border-t-0 md:border-l md:pl-5 md:pt-0">
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Per night</p>
                            <div className="mt-1 text-3xl font-black text-white">₹{formatCurrency(room.price)}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedRoomId(room.id || room._id)}
                            className={`rounded-2xl px-5 py-3 text-sm font-bold transition ${
                              isActive
                                ? 'bg-cyan-400 text-[#05101f] shadow-[0_12px_30px_rgba(34,211,238,0.25)]'
                                : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                            }`}
                          >
                            {isActive ? 'Selected' : 'Select room'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Amenities */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-8"
            >
              <SectionHeader
                eyebrow="Amenities"
                title="Amenities and facilities"
                description="Everything that makes this stay comfortable, premium, and easy to enjoy."
              />

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {hotel.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                      {amenityIcons[amenity] || <FaRegCheckCircle />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{amenity}</p>
                      <p className="text-[11px] text-slate-400">Premium facility</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Location */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-8"
            >
              <SectionHeader
                eyebrow="Location"
                title="Location, nearby attractions, and map"
                description="Check where the hotel sits and what is close by before confirming your stay."
              />

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-4">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                        <FaLocationArrow />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Full address</p>
                        <p className="mt-1 text-sm font-semibold text-white">{hotel.addressLine}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                          <FaPlane />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Airport</p>
                          <p className="mt-1 text-sm font-bold text-white">{hotel.airport?.name}</p>
                          <p className="text-xs text-slate-400">{hotel.airport?.distance} away</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                          <FaTrain />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Railway station</p>
                          <p className="mt-1 text-sm font-bold text-white">{hotel.railway?.name}</p>
                          <p className="text-xs text-slate-400">{hotel.railway?.distance} away</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Nearby attractions</p>
                    <div className="mt-4 space-y-3">
                      {hotel.nearbyAttractions.map((item) => (
                        <div key={item.name} className="flex items-start gap-3">
                          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                            <FaChevronRight size={10} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.distance} • {item.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-5">
                  <div className="flex h-full min-h-[320px] flex-col justify-between rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">Map placeholder</p>
                      <h4 className="text-2xl font-black text-white">{hotel.mapLabel}</h4>
                      <p className="text-sm leading-7 text-slate-300">
                        {hotel.fullAddress}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Closest landmark</p>
                        <p className="mt-1 text-sm font-bold text-white">{hotel.nearbyAttractions[0]?.name}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Travel style</p>
                        <p className="mt-1 text-sm font-bold text-white">{hotel.tagline}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-[1.2rem] border border-cyan-400/20 bg-cyan-400/10 p-4">
                      <div className="flex items-center gap-3">
                        <FaInfoCircle className="text-cyan-300" />
                        <p className="text-sm text-cyan-100">
                          Location details are curated from hotel data and travel context so the page stays accurate even for AI-generated stays.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Policies */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-8"
            >
              <SectionHeader
                eyebrow="Policies"
                title="Hotel policies"
                description="A quick read before booking helps set expectations clearly."
              />

              <div className="grid gap-3 md:grid-cols-2">
                {hotel.policies.map((policy, idx) => (
                  <div key={policy} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                      <FaCheckCircle size={12} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Policy {idx + 1}</p>
                      <p className="mt-1 text-sm leading-7 text-slate-300">{policy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Reviews */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-8"
            >
              <SectionHeader
                eyebrow="Reviews"
                title="Reviews and rating breakdown"
                description="Guest feedback highlights the quality, comfort, and overall stay experience."
              />

              <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-cyan-500/15 text-2xl font-black text-cyan-200">
                      {averageRating.toFixed(1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-amber-300">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <FaStar key={idx} className={idx < Math.round(averageRating) ? '' : 'opacity-25'} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{reviewCount} verified reviews</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {ratingBreakdown.map((entry) => (
                      <div key={entry.score} className="grid grid-cols-[24px_1fr_42px] items-center gap-3">
                        <div className="text-xs font-bold text-slate-300">{entry.score}</div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                            style={{ width: `${entry.percent}%` }}
                          />
                        </div>
                        <div className="text-right text-xs text-slate-400">{entry.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {recentReviews.length > 0 ? (
                    recentReviews.map((review) => (
                      <div key={review._id} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15 text-sm font-black text-cyan-200">
                              {(review.userName || 'G')[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{review.userName || 'Guest'}</p>
                              <p className="text-[11px] text-slate-400">
                                {review.createdAt
                                  ? new Date(review.createdAt).toLocaleDateString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'Recently'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-300">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <FaStar key={idx} className={idx < Math.round(Number(review.rating || 0)) ? '' : 'opacity-25'} />
                            ))}
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-7 text-slate-300">
                          <FaQuoteLeft className="mr-2 inline text-cyan-300/60" />
                          {review.comment || 'A great stay with smooth service and a polished atmosphere.'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/5 p-8 text-center">
                      <p className="text-sm font-semibold text-slate-300">No reviews yet for this hotel.</p>
                      <p className="mt-2 text-xs text-slate-500">Guest ratings will appear here once bookings start coming in.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Similar hotels */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] md:p-8"
            >
              <SectionHeader
                eyebrow="Similar hotels"
                title="Similar hotels from the same location"
                description="A few more properties in the same area, kept visually consistent and hotel-only."
              />

              {similarHotels.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {similarHotels.map((item) => (
                    <button
                      key={item.id || item._id}
                      type="button"
                      onClick={() => navigate(`/hotels/${item.id || item._id}`)}
                      className="group overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/5 text-left transition hover:-translate-y-1 hover:border-cyan-400/30"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <SelfHealingImage
                          src={item.heroImage || item.image || item.images?.[0]}
                          alt={`${item.name} | ${item.location || item.city || ''}`}
                          entityId={item.id || item._id}
                          type="hotel"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                          ₹{formatCurrency(item.pricePerNight || item.price)} / night
                        </div>
                      </div>
                      <div className="space-y-2 p-4">
                        <h3 className="text-lg font-black text-white">{item.name}</h3>
                        <p className="text-sm text-slate-400">{item.location || item.city}</p>
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                          <FaStar />
                          {(item.rating || 4.5).toFixed(1)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-300">No similar hotels found for this location.</p>
                </div>
              )}
            </motion.section>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[2rem] border border-white/10 bg-[#0a1224] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.25)] md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Booking summary</p>
                  <h3 className="mt-2 text-2xl font-black text-white">Confirm & Book Now</h3>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">Room selected</p>
                  <p className="mt-1 text-sm font-bold text-white">{selectedRoom?.roomType || 'Standard Room'}</p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5">
                <div className="relative h-52">
                  <SelfHealingImage
                    src={selectedRoom?.image || hotel.heroImage}
                    alt={`${selectedRoom?.roomType || hotel.name} | ${hotel.location}`}
                    entityId={hotel.id}
                    type="hotel"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Room selection</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#07101f] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400"
                  >
                    {roomOptions.map((room) => (
                      <option key={room.id || room._id} value={room.id || room._id}>
                        {room.roomType} - ₹{formatCurrency(room.price)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (checkOut && new Date(e.target.value) >= new Date(checkOut)) {
                        setCheckOut(toDateInput(addDays(new Date(e.target.value), 1)));
                      }
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || undefined}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Guests</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400"
                >
                  {[1, 2, 3, 4, 5, 6].map((guestCount) => (
                    <option key={guestCount} value={guestCount}>
                      {guestCount} guest{guestCount > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 space-y-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{nights} night{nights > 1 ? 's' : ''} x ₹{formatCurrency(roomRate)}</span>
                  <span>₹{formatCurrency(roomSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Guest surcharge</span>
                  <span>₹{formatCurrency(extraGuestCharge)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Taxes & service</span>
                  <span>₹{formatCurrency(taxes)}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">Total amount</span>
                  <span className="text-2xl font-black text-white">₹{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-cyan-400 px-5 py-4 text-lg font-black text-[#06111f] shadow-[0_16px_35px_rgba(34,211,238,0.25)] transition hover:-translate-y-0.5 hover:bg-cyan-300 active:translate-y-0"
              >
                Confirm & Book Now
                <FaChevronRight />
              </button>

              <div className="mt-5 rounded-[1.4rem] border border-cyan-400/20 bg-cyan-400/10 p-4">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="mt-0.5 text-cyan-300" />
                  <p className="text-sm leading-7 text-cyan-100">
                    The booking summary updates instantly as you switch rooms, guests, and dates. Hotel-specific images stay premium and hotel-only.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Gallery modal */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl"
          >
            <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/70">Gallery</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{hotel.name}</h3>
                </div>
                <button
                  onClick={() => setGalleryOpen(false)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Close
                </button>
              </div>
              <div className="grid flex-1 gap-4 overflow-y-auto pb-10 sm:grid-cols-2 lg:grid-cols-4">
                {galleryImages.map((image, idx) => (
                  <button
                    key={`${image}-modal-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveImage(image);
                      setGalleryOpen(false);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5"
                  >
                    <SelfHealingImage
                      src={image}
                      alt={`${hotel.name} gallery ${idx + 1}`}
                      entityId={hotel.id}
                      type="hotel"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotelDetailsTemplate;
