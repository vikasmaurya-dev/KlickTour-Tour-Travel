import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaTrash, FaSearch, FaStar, FaQuoteLeft } from 'react-icons/fa';
import { api } from '../../../services/api';
import AdminLoader from '../components/AdminLoader';
import { matchesSearchFields } from '../../../utils/search';

const Reviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');

  useEffect(() => {
    loadItems();
  }, []);

  const updateSearch = (value) => {
    setSearch(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set('q', value);
    else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };

  const loadItems = async () => {
    try {
      const data = await api.getAllReviews();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await api.deleteReview(id);
        loadItems();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const activeSearch = searchParams.get('q') || search;
  const filteredItems = items.filter(item => 
    matchesSearchFields(item, activeSearch, [
      'comment',
      'rating',
      (row) => row.userId?.name,
      (row) => row.packageId?.name,
      (row) => row.packageId?.location,
    ])
  );

  return (
    <div className="admin-module">
      <header className="admin-header">
        <div className="admin-title-section">
          <h1>Reviews & Ratings</h1>
          <p>Monitor customer feedback and ratings</p>
        </div>
      </header>

      <div className="filters-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="search-box" style={{ flex: 1, position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search reviews by user, package or comment..." 
            value={activeSearch}
            onChange={(e) => updateSearch(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', color: 'white' }}
          />
        </div>
      </div>

      <div className="data-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Package</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">
                  <AdminLoader message="Aggregating User Feedback..." />
                </td>
              </tr>
            ) : filteredItems.map((item) => (
              <tr key={item._id}>
                <td>
                    <span style={{ fontWeight: 600 }}>{item.userId?.name || 'Deleted User'}</span>
                </td>
                <td>{item.packageId?.name || 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                    <FaStar /> {item.rating}
                  </div>
                </td>
                <td style={{ maxWidth: '300px' }}>
                    <div style={{ display: 'flex', gap: '8px', fontStyle: 'italic', color: '#cbd5e1', fontSize: '0.9rem' }}>
                        <FaQuoteLeft style={{ flexShrink: 0, marginTop: '4px', opacity: 0.5 }} />
                        <span style={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {item.comment}
                        </span>
                    </div>
                </td>
                <td>
                  <div className="actions-cell">
                    <button className="icon-btn delete" onClick={() => handleDelete(item._id)} title="Delete Review">
                        <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filteredItems.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <FaStar style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }} />
                <p>No reviews found.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
