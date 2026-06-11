import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Adventure Enthusiast",
    text: "KlickTour made my Kashmir trip unforgettable. The itinerary was perfectly balanced and the hotels were top-notch!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=rahul"
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Family Traveler",
    text: "Booking through KlickTour was the best decision for our Kerala vacation. Everything was handled professionally.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=priya"
  },
  {
    id: 3,
    name: "Ankit Verma",
    role: "Solo Backpacker",
    text: "Great prices and even better service. The AI trip planner helped me find hidden gems in Himachal.",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?u=ankit"
  },
  {
    id: 4,
    name: "Sneha Reddy",
    role: "Luxury Traveler",
    text: "The premium packages are truly premium. From the flight to the stay, everything was luxurious.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=sneha"
  }
];

export const Testimonials = () => {
  return (
    <section className="section testimonials-section section-muted">
      <div className="container">
        <div className="section-header section-header-centered">
          <h2 className="section-title">What Our Travelers Say</h2>
          <p className="section-subtitle">Real stories from real travelers who explored the world with us</p>
        </div>

        <div className="testimonials-infinite-scroll">
          <div className="testimonials-track">
            {[...testimonials, ...testimonials].map((item, index) => (
              <div key={`${item.id}-${index}`} className="testimonial-card premium-card">
                <div className="quote-icon"><FaQuoteLeft /></div>
                <div className="stars">
                  {[...Array(item.rating)].map((_, i) => <FaStar key={i} />)}
                </div>
                <p className="testimonial-text">{item.text}</p>
                <div className="testimonial-author">
                  <img src={item.avatar} alt={item.name} />
                  <div className="author-info">
                    <h4>{item.name}</h4>
                    <span>{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
