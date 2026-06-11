import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Home.css';

// Import new modular components
import { HeroSection } from '../components/home/HeroSection';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { FeaturedDestinations } from '../components/home/FeaturedDestinations';
import { TrendingPackages } from '../components/home/TrendingPackages';
import { TravelModesPreview } from '../components/home/TravelModesPreview';
import { AITripPlanner } from '../components/home/AITripPlanner';
import { Testimonials } from '../components/home/Testimonials';
import { CTASection } from '../components/home/CTASection';

const Home = () => {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destData, pkgData] = await Promise.all([
          api.getDestinations(),
          api.getPackages(),
        ]);
        setDestinations(Array.isArray(destData) ? destData : destData?.data || []);
        setPackages(Array.isArray(pkgData) ? pkgData : pkgData?.data || []);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* 1. Cinematic Hero Section */}
      <HeroSection destinations={destinations} />

      {/* 2. Premium Features / Why Choose Us */}
      <WhyChooseUs />

      {/* 3. Featured Destinations (Scrollable) */}
      <FeaturedDestinations destinations={destinations} loading={loading} />

      {/* 4. Trending Packages (Scrollable) */}
      <TrendingPackages packages={packages} loading={loading} />

      {/* 6. Travel Modes Preview */}
      <TravelModesPreview />

      {/* 7. AI Trip Planner Preview */}
      <AITripPlanner />

      {/* 8. Premium Testimonials (Infinite Scroll) */}
      <Testimonials />

      {/* 9. Final Call to Action */}
      <CTASection />
    </div>
  );
};

export default Home;
