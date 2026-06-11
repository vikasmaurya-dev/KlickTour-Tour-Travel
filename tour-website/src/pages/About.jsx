import React from 'react';
import { FaAward, FaGlobe, FaUsers } from 'react-icons/fa';

const About = () => {
  return (
    <div className="about-page">
      <div className="page-header" style={{backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"}}>
        <div className="container">
          <h1>About KlickTour</h1>
          <p>Your trusted partner in exploring the world.</p>
        </div>
      </div>

      <div className="section container">
        <div className="grid grid-2" style={{alignItems: 'center', gap: '50px'}}>
          <div>
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80" alt="Our Story" style={{borderRadius: '16px', boxShadow: 'var(--shadow-lg)'}} />
          </div>
          <div>
            <h2 className="section-title" style={{textAlign: 'left'}}>Our Story</h2>
            <p className="mb-4">Founded in 2010, KlickTour began with a simple idea: to make travel accessible, enjoyable, and unforgettable for everyone. What started as a small local agency has grown into a global travel partner, helping thousands of wanderers discover the beauty of our planet.</p>
            <p>Our mission is to curate exceptional travel experiences that inspire, rejuvenate, and create lifelong memories. We believe travel is not just about visiting places, but connecting with cultures, nature, and oneself.</p>
          </div>
        </div>
      </div>

      <div className="section bg-secondary">
        <div className="container text-center">
          <h2 className="section-title">Why Travel With Us?</h2>
          <div className="grid grid-3">
            <div className="card" style={{padding: '30px'}}>
              <FaGlobe style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px'}} />
              <h3>Global Reach</h3>
              <p>We offer destinations across 6 continents, bringing the world to your fingertips.</p>
            </div>
            <div className="card" style={{padding: '30px'}}>
              <FaUsers style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px'}} />
              <h3>Expert Guides</h3>
              <p>Our knowledgeable local guides ensure you get the most authentic experiences.</p>
            </div>
            <div className="card" style={{padding: '30px'}}>
              <FaAward style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px'}} />
              <h3>Award Winning</h3>
              <p>Recognized as a top travel agency for our outstanding customer service and tours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
