import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-links">
          <div className="footer-link-wrapper">
            <div className="footer-link-items">
              <Link to="/" className="footer-logo">
                <img src="/klicktour-logo-dark-cropped.png" alt="KlickTour" className="footer-logo-img" />
              </Link>
              <p className="footer-desc">
                Experience the world with us. Unforgettable trips, unbeatable prices, and excellent service.
              </p>
            </div>
            <div className="footer-link-items">
              <h2>Quick Links</h2>
              {/* <Link to="/about">About Us</Link> */}
              <Link to="/destinations">Destinations</Link>
              <Link to="/packages">Tour Packages</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div className="footer-link-wrapper">
            <div className="footer-link-items">
              <h2>Support</h2>
              <Link to="/">FAQ</Link>
              <Link to="/">Terms of Service</Link>
              <Link to="/">Privacy Policy</Link>
            </div>
            <div className="footer-link-items">
              <h2>Newsletter</h2>
              <p className="footer-desc">Subscribe to our newsletter to get latest updates.</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your Email" className="footer-input" required />
                <button type="submit" className="btn btn-secondary">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
        
        <section className="social-media">
          <div className="social-media-wrap">
            <small className="website-rights">KlickTour &copy; {new Date().getFullYear()} All rights reserved.</small>
            <div className="social-icons">
              <Link className="social-icon-link facebook" to="/" aria-label="Facebook">
                <FaFacebook />
              </Link>
              <Link className="social-icon-link instagram" to="/" aria-label="Instagram">
                <FaInstagram />
              </Link>
              <Link className="social-icon-link youtube" to="/" aria-label="Youtube">
                <FaYoutube />
              </Link>
              <Link className="social-icon-link twitter" to="/" aria-label="Twitter">
                <FaTwitter />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
