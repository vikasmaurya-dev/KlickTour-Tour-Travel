import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft,
  FaCalendarDay,
  FaDownload,
  FaHotel,
  FaMapMarkerAlt,
  FaRoute,
  FaShareAlt,
  FaUtensils,
  FaWallet,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { aiTripService } from '../services/aiTripService';
import './AITripResult.css';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const AITripResultSkeleton = () => (
  <div className="ai-trip-result-page">
    <section className="ai-trip-result-hero skeleton-hero">
      <div className="ai-trip-result-shell">
        <div className="ai-trip-skeleton-line wide" />
        <div className="ai-trip-skeleton-line title" />
        <div className="ai-trip-skeleton-line" />
      </div>
    </section>
    <div className="ai-trip-result-shell ai-trip-result-grid">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="ai-trip-panel">
          <div className="ai-trip-skeleton-line" />
          <div className="ai-trip-skeleton-line short" />
          <div className="ai-trip-skeleton-block" />
        </div>
      ))}
    </div>
  </div>
);

const listItems = (items = []) => items.filter(Boolean);

const AITripResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tripRecord, setTripRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTrip = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await aiTripService.getTripById(id);
        setTripRecord(data);
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Could not load this trip.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [id]);

  const trip = tripRecord?.trip;
  const shareUrl = useMemo(() => window.location.href, []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: trip?.title || 'KlickTour AI Trip',
          text: trip?.summary || 'Check out this generated travel itinerary.',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Trip link copied.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') toast.error('Unable to share right now.');
    }
  };

  const handleDownload = () => {
    const payload = {
      title: trip?.title,
      prompt: tripRecord?.prompt,
      trip,
      createdAt: tripRecord?.createdAt,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(trip?.title || 'klicktour-trip').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Trip downloaded.');
  };

  if (loading) return <AITripResultSkeleton />;

  if (error || !trip) {
    return (
      <div className="ai-trip-result-page ai-trip-error-state">
        <div className="ai-trip-panel">
          <h1>Trip unavailable</h1>
          <p>{error || 'This generated trip could not be found.'}</p>
          <button type="button" onClick={() => navigate('/')} className="ai-trip-primary-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-trip-result-page">
      <section className="ai-trip-result-hero">
        {trip.heroImage ? <img src={trip.heroImage} alt={trip.title} /> : null}
        <div className="ai-trip-result-overlay" />
        <div className="ai-trip-result-shell">
          <button type="button" onClick={() => navigate('/')} className="ai-trip-back-btn">
            <FaArrowLeft /> Back
          </button>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.55 }}>
            <span className="ai-trip-kicker">Generated itinerary</span>
            <h1>{trip.title}</h1>
            <p>{trip.summary}</p>
            <div className="ai-trip-hero-meta">
              {trip.destination ? <span><FaMapMarkerAlt /> {trip.destination}</span> : null}
              {trip.duration ? <span><FaCalendarDay /> {trip.duration}</span> : null}
              {trip.travelers ? <span><FaRoute /> {trip.travelers}</span> : null}
            </div>
            <div className="ai-trip-actions">
              <button type="button" onClick={handleDownload}><FaDownload /> Download</button>
              <button type="button" onClick={handleShare}><FaShareAlt /> Share</button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="ai-trip-result-shell ai-trip-result-content">
        <section className="ai-trip-section">
          <div className="ai-trip-section-title">
            <FaCalendarDay />
            <div>
              <h2>Day-wise itinerary</h2>
              <p>Follow the trip one day at a time.</p>
            </div>
          </div>
          <div className="ai-trip-days">
            {trip.days.map((day, index) => (
              <motion.article
                key={`${day.day}-${day.title}`}
                className="ai-trip-day-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <div className="ai-trip-day-number">Day {day.day}</div>
                <div>
                  <span>{day.theme}</span>
                  <h3>{day.title}</h3>
                  <p>{day.description}</p>
                  <div className="ai-trip-timeline">
                    {listItems(day.activities).map((activity, activityIndex) => (
                      <div key={`${activity.title}-${activityIndex}`} className="ai-trip-timeline-item">
                        <strong>{activity.time || 'Plan'}</strong>
                        <div>
                          <h4>{activity.title}</h4>
                          <p>{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <aside className="ai-trip-side-grid">
          <section className="ai-trip-panel">
            <div className="ai-trip-panel-title"><FaWallet /> Budget breakdown</div>
            <strong className="ai-trip-budget-total">{trip.budget?.totalEstimate || 'Flexible'}</strong>
            {listItems(trip.budget?.breakdown).map((item) => (
              <div className="ai-trip-budget-row" key={`${item.label}-${item.amount}`}>
                <span>{item.label}</span>
                <strong>{item.amount}</strong>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            ))}
          </section>

          <section className="ai-trip-panel">
            <div className="ai-trip-panel-title"><FaHotel /> Hotel suggestions</div>
            {listItems(trip.hotels).map((hotel) => (
              <div className="ai-trip-hotel" key={hotel.name}>
                <h3>{hotel.name}</h3>
                <p>{hotel.area}</p>
                <span>{hotel.priceRange}</span>
                <small>{hotel.why}</small>
              </div>
            ))}
          </section>
        </aside>

        <section className="ai-trip-info-grid">
          <div className="ai-trip-panel">
            <div className="ai-trip-panel-title"><FaMapMarkerAlt /> Best places</div>
            {listItems(trip.bestPlaces).map((place) => <span className="ai-trip-chip" key={place}>{place}</span>)}
          </div>
          <div className="ai-trip-panel">
            <div className="ai-trip-panel-title"><FaUtensils /> Food recommendations</div>
            {listItems(trip.foodRecommendations).map((food) => <span className="ai-trip-chip" key={food}>{food}</span>)}
          </div>
          <div className="ai-trip-panel">
            <div className="ai-trip-panel-title"><FaRoute /> Transportation tips</div>
            {listItems(trip.transportationTips).map((tip) => <p className="ai-trip-note" key={tip}>{tip}</p>)}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AITripResult;
