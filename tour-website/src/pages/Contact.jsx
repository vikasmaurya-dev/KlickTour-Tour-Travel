import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { api } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.sendContactMessage(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert('Failed to send message. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="page-header" style={{backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1484807352052-23338990c6c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"}}>
        <div className="container">
          <h1>Contact Us</h1>
          <p>We're here to help you plan your dream vacation.</p>
        </div>
      </div>

      <div className="section container">
        <div className="grid grid-2" style={{gap: '50px'}}>
          <div className="contact-info">
            <h2 className="section-title" style={{textAlign: 'left'}}>Get In Touch</h2>
            <p className="mb-4">Have questions about our tours? Need a custom itinerary? Reach out to us and our travel experts will be happy to assist you.</p>
            
            <div style={{marginBottom: '30px'}}>
              <div style={{display: 'flex', alignItems: 'flex-start', marginBottom: '20px'}}>
                <FaMapMarkerAlt style={{fontSize: '1.5rem', color: 'var(--primary)', marginRight: '20px', marginTop: '5px'}} />
                <div>
                  <h4>Our Office</h4>
                  <p style={{color: 'var(--text-muted)'}}>123 KlickTour Blvd, Suite 400<br/>New York, NY 10001, USA</p>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'flex-start', marginBottom: '20px'}}>
                <FaPhoneAlt style={{fontSize: '1.5rem', color: 'var(--primary)', marginRight: '20px', marginTop: '5px'}} />
                <div>
                  <h4>Phone</h4>
                  <p style={{color: 'var(--text-muted)'}}>+1 800 123 4567<br/>+1 212 987 6543</p>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'flex-start', marginBottom: '20px'}}>
                <FaEnvelope style={{fontSize: '1.5rem', color: 'var(--primary)', marginRight: '20px', marginTop: '5px'}} />
                <div>
                  <h4>Email</h4>
                  <p style={{color: 'var(--text-muted)'}}>info@wanderlust.com<br/>support@wanderlust.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card" style={{padding: '40px'}}>
            <h3 style={{marginBottom: '20px'}}>Send us a message</h3>
            {success && (
              <div style={{padding: '12px 20px', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderRadius: '8px', marginBottom: '20px', fontWeight: 500}}>
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-color)'}} required/>
              </div>
              <div className="form-group" style={{marginTop: '15px'}}>
                <label>Your Email</label>
                <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-color)'}} required/>
              </div>
              <div className="form-group" style={{marginTop: '15px'}}>
                <label>Subject</label>
                <input type="text" name="subject" placeholder="Inquiry about Paris Tour" value={formData.subject} onChange={handleChange} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-color)'}} required/>
              </div>
              <div className="form-group" style={{marginTop: '15px'}}>
                <label>Message</label>
                <textarea rows="5" name="message" placeholder="Your message here..." value={formData.message} onChange={handleChange} style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-color)', resize: 'vertical'}} required></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{marginTop: '20px', width: '100%'}} disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Interactive Map Embed */}
      <div style={{width: '100%', height: '400px'}}>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.183948655837!2d-73.99042292346914!3d40.75800043477123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
          width="100%" 
          height="100%" 
          style={{border: 0}} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Office Location"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
