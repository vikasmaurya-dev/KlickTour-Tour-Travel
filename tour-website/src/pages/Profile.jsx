import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { bookingService } from '../services/bookingService';
import { FaUserEdit, FaLock, FaSuitcaseRolling, FaMapMarkerAlt, FaHeart, FaTrash, FaCamera, FaSpinner, FaTimes } from 'react-icons/fa';
import { ListSkeleton } from '../components/Skeleton';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('edit-profile');
  
  // Forms
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    setWishlistLoading(true);
    try {
      const data = await api.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
    if (activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [activeTab, fetchBookings, fetchWishlist]);

  const removeWishlistItem = async (id) => {
    try {
      await api.removeWishlistItem(id);
      fetchWishlist();
      toast.success('Removed from wishlist.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ─── Avatar helpers ────────────────────────────────────────
  const resizeImage = (file, maxSize = 400) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
          } else {
            if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
          }

          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.85));
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      return;
    }

    try {
      const resized = await resizeImage(file);
      setAvatarPreview(resized);
    } catch {
      toast.error('Failed to process image.');
    }

    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return;
    setAvatarLoading(true);
    try {
      await updateProfile({ avatar: avatarPreview });
      setAvatarPreview(null);
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update photo.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarLoading(true);
    try {
      await updateProfile({ avatar: '' });
      setAvatarPreview(null);
      toast.success('Profile photo removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove photo.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setLoading(true);
    try {
      await updateProfile({ name, phone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setProfileMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setProfileMsg({ type: '', text: '' });
    setLoading(true);
    try {
      await updateProfile({ password });
      setProfileMsg({ type: 'success', text: user.hasPassword ? 'Password changed successfully!' : 'Password created successfully!' });
      setPassword('');
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="profile-page"><div className="container text-center">Please login to view your profile.</div></div>;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Which avatar image to display (preview takes priority)
  const displayAvatar = avatarPreview || user.avatar;

  return (
    <div className="profile-page section">
      <div className="container profile-layout">
        
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="card user-card">
            {/* Clickable avatar area */}
            <div className="avatar-upload-wrap">
              <button
                type="button"
                className="user-avatar avatar-clickable"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                title="Change profile photo"
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt={user.name} className="user-avatar-img" />
                ) : (
                  getInitials(user.name)
                )}
                <div className="avatar-overlay">
                  {avatarLoading ? <FaSpinner className="avatar-spinner" /> : <FaCamera />}
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="avatar-file-input"
                onChange={handleAvatarSelect}
              />

              {/* Action buttons below avatar */}
              {avatarPreview ? (
                <div className="avatar-actions">
                  <button
                    type="button"
                    className="avatar-action-btn avatar-save-btn"
                    onClick={handleAvatarUpload}
                    disabled={avatarLoading}
                  >
                    {avatarLoading ? <><FaSpinner className="avatar-spinner" /> Saving...</> : 'Save Photo'}
                  </button>
                  <button
                    type="button"
                    className="avatar-action-btn avatar-cancel-btn"
                    onClick={() => setAvatarPreview(null)}
                    disabled={avatarLoading}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              ) : (
                <div className="avatar-actions">
                  <button
                    type="button"
                    className="avatar-action-btn avatar-change-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                  >
                    <FaCamera /> Change Photo
                  </button>
                  {user.avatar ? (
                    <button
                      type="button"
                      className="avatar-action-btn avatar-remove-btn"
                      onClick={handleAvatarRemove}
                      disabled={avatarLoading}
                    >
                      {avatarLoading ? <FaSpinner className="avatar-spinner" /> : <><FaTrash /> Remove</>}
                    </button>
                  ) : null}
                </div>
              )}
            </div>

            <h3>{user.name}</h3>
            <p className="user-email">{user.email}</p>
            <div className="user-badge">{user.role}</div>
            <p className="user-member-since">Signed in with {user.authProvider === 'google' ? 'Google' : 'Email'}</p>
            <p className="user-member-since">{user.isVerified ? 'Verified account' : 'Verification pending'}</p>
            {user.createdAt ? (
              <p className="user-member-since">Member since {formatDate(user.createdAt)}</p>
            ) : null}
          </div>

          <div className="card profile-nav">
            <button 
              className={`profile-nav-btn ${activeTab === 'edit-profile' ? 'active' : ''}`}
              onClick={() => { setActiveTab('edit-profile'); setProfileMsg({type:'',text:''}); }}
            >
              <FaUserEdit /> Edit Profile
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'change-password' ? 'active' : ''}`}
              onClick={() => { setActiveTab('change-password'); setProfileMsg({type:'',text:''}); }}
            >
              <FaLock /> {user.hasPassword ? 'Change Password' : 'Set Password'}
            </button>
            <button 
              className={`profile-nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('bookings'); setProfileMsg({type:'',text:''}); }}
            >
              <FaSuitcaseRolling /> My Bookings
            </button>
            <button
              className={`profile-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => { setActiveTab('wishlist'); setProfileMsg({type:'',text:''}); }}
            >
              <FaHeart /> Wishlist
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="profile-content">
          <div className="card profile-section-card">
            
            {activeTab === 'edit-profile' && (
              <div className="profile-form">
                <h2>Edit Profile</h2>
                {profileMsg.text && <div className={`alert ${profileMsg.type}`}>{profileMsg.text}</div>}
                
                <form onSubmit={handleUpdateProfile}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number (Optional)</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={user.email} disabled />
                    <small style={{color: 'var(--text-muted)'}}>Email address cannot be changed.</small>
                  </div>
                  
                  <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'change-password' && (
              <div className="profile-form">
                <h2>{user.hasPassword ? 'Change Password' : 'Set a Local Password'}</h2>
                {profileMsg.text && <div className={`alert ${profileMsg.type}`}>{profileMsg.text}</div>}
                {!user.hasPassword ? (
                  <p style={{color: 'var(--text-muted)', marginBottom: '18px'}}>
                    Add a password once so you can log in with email later, even if you first joined with Google.
                  </p>
                ) : null}
                
                <form onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label>{user.hasPassword ? 'New Password' : 'Create Password'}</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Min. 6 characters"
                      required 
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                    {loading ? 'Updating...' : user.hasPassword ? 'Update Password' : 'Save Password'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="profile-bookings">
                <h2>My Bookings</h2>
                
                {bookingsLoading ? (
                  <ListSkeleton count={2} />
                ) : bookings.length === 0 ? (
                  <div className="text-center py-5">
                    <FaSuitcaseRolling style={{fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '15px'}} />
                    <h4>No Bookings Yet!</h4>
                    <p className="text-muted" style={{marginBottom: '20px'}}>You haven't booked any tours with us yet.</p>
                    <Link to="/packages" className="btn btn-primary">Explore Packages</Link>
                  </div>
                ) : (
                  <div className="booking-list">
                    {bookings.map((booking) => (
                      <div className="booking-item" key={booking._id}>
                        {booking.packageId?.image && (
                          <div className="booking-img-wrap">
                            <img src={booking.packageId.image} alt="Package" />
                          </div>
                        )}
                        <div className="booking-details">
                          <div className="booking-header">
                            <div>
                              <h4>{booking.packageId?.name || 'Unknown Package'}</h4>
                              {booking.packageId?.location && (
                                <p className="booking-location"><FaMapMarkerAlt /> {booking.packageId.location}</p>
                              )}
                            </div>
                            <span className={`status-badge ${booking.status.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="booking-info-grid">
                            <div className="info-col">
                              <span className="info-label">Travel Date</span>
                              <span className="info-value">{formatDate(booking.travelDate)}</span>
                            </div>
                            <div className="info-col">
                              <span className="info-label">Travelers</span>
                              <span className="info-value">{booking.travelers} People</span>
                            </div>
                            <div className="info-col">
                              <span className="info-label">Total Paid</span>
                              <span className="info-value" style={{color: 'var(--primary)'}}>₹{booking.totalPrice}</span>
                            </div>
                            <div className="info-col">
                              <span className="info-label">Invoice</span>
                              <span className="info-value">{booking.invoiceNumber || 'Pending'}</span>
                            </div>
                            {booking.discountAmount > 0 && (
                              <div className="info-col">
                                <span className="info-label">Discount</span>
                                <span className="info-value">₹{booking.discountAmount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="profile-bookings">
                <h2>My Wishlist</h2>

                {wishlistLoading ? (
                  <ListSkeleton count={2} />
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-5">
                    <FaHeart style={{fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '15px'}} />
                    <h4>No Saved Trips Yet!</h4>
                    <p className="text-muted" style={{marginBottom: '20px'}}>Save packages and hotels you want to revisit later.</p>
                    <Link to="/packages" className="btn btn-primary">Explore Packages</Link>
                  </div>
                ) : (
                  <div className="booking-list">
                    {wishlist.map((item) => (
                      <div className="booking-item" key={item._id}>
                        {item.image && (
                          <div className="booking-img-wrap">
                            <img src={item.image} alt={item.title} />
                          </div>
                        )}
                        <div className="booking-details">
                          <div className="booking-header">
                            <div>
                              <h4>{item.title}</h4>
                              <p className="booking-location"><FaMapMarkerAlt /> {item.meta || item.itemType}</p>
                            </div>
                            <span className="status-badge confirmed">{item.itemType}</span>
                          </div>
                          <div className="booking-info-grid">
                            <div className="info-col">
                              <span className="info-label">Price</span>
                              <span className="info-value" style={{color: 'var(--primary)'}}>₹{item.price}</span>
                            </div>
                            <div className="info-col">
                              <span className="info-label">Saved On</span>
                              <span className="info-value">{formatDate(item.createdAt)}</span>
                            </div>
                          </div>
                          <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                            <Link className="btn btn-primary" to={item.itemType === 'hotel' ? `/hotels/${item.itemId}` : `/packages/${item.itemId}`}>View Details</Link>
                            <button className="btn btn-outline" type="button" onClick={() => removeWishlistItem(item._id)}><FaTrash /> Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
