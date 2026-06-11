import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRobot, FaMagic } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { aiTripService } from '../../services/aiTripService';
import aiTripTraveler from '../../assets/ai-trip-traveler.png';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export const AITripPlanner = () => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async (e) => {
    e.preventDefault();
    const nextPrompt = prompt.trim();

    if (!nextPrompt) {
      toast.error('Tell us what kind of trip you want.');
      return;
    }

    if (nextPrompt.length < 8) {
      toast.error('Add a little more detail for a better itinerary.');
      return;
    }

    setGenerating(true);
    try {
      const result = await aiTripService.generateTrip(nextPrompt);
      toast.success(result.message || 'Your trip is ready.');
      navigate(`/ai-trip-result/${result.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Could not generate your trip.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="section ai-planner-section">
      <div className="bg-glow-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <motion.div 
        className="container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUpVariant}
      >
        <div className="ai-planner-card glass-card">
          <div className="ai-planner-content">
            <div className="ai-badge">
              <FaRobot className="ai-icon" />
              <span>AI Powered</span>
            </div>
            <h2>Plan Your Dream Trip <span className="text-gradient">in Seconds</span></h2>
            <p>Tell our AI your preferences and get a personalized, curated itinerary for your next adventure.</p>
            
            <form className="ai-input-wrapper" onSubmit={handleGenerate}>
              <input 
                type="text" 
                placeholder="e.g. 5-day budget trip to Manali for 2 people"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button type="submit" className="btn btn-primary ai-btn" disabled={generating}>
                {generating ? (
                  <>
                    <span className="ai-btn-spinner" aria-hidden="true" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaMagic /> Generate My Trip
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="ai-planner-visual">
            <div className="floating-card c1">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
            <div className="floating-card c2">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
            <div className="ai-glow-circle"></div>
            <img
              src={aiTripTraveler}
              alt=""
              aria-hidden="true"
              className="ai-trip-traveler"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
};
