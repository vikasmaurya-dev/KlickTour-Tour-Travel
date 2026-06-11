import React from 'react';
import { Link } from 'react-router-dom';

const blogPosts = [
  { id: 1, title: "10 Essential Travel Hacks for First-Time Flyers", category: "Travel Tips", date: "Oct 15, 2026", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80", excerpt: "Flying for the first time? Don't panic. Here are 10 essential tips to make your journey smooth..." },
  { id: 2, title: "The Ultimate Guide to Backpacking in Southeast Asia", category: "Destination Guide", date: "Sep 22, 2026", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80", excerpt: "Southeast Asia is a backpacker's paradise. Let's dive into the best routes, budgets, and hidden gems..." },
  { id: 3, title: "How to Travel Sustainably in 2026", category: "Eco Travel", date: "Aug 05, 2026", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80", excerpt: "As global travel resumes, it's more important than ever to minimize our carbon footprint while exploring..." },
  { id: 4, title: "Top 5 Hidden Beaches in Europe You Must Visit", category: "Hidden Gems", date: "Jul 18, 2026", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80", excerpt: "Escape the crowds and discover these pristine, secret coastal spots across the Mediterranean..." }
];

const Blog = () => {
  return (
    <div className="blog-page">
      <div className="page-header" style={{backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1455390582262-044cdead27d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')"}}>
        <div className="container">
          <h1>Travel Blog</h1>
          <p>Tips, stories, and guides from our travel experts.</p>
        </div>
      </div>

      <div className="section container">
        <div className="grid grid-3">
          {blogPosts.map(post => (
            <div className="card blog-card" key={post.id} style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{position: 'relative', overflow: 'hidden', height: '220px'}}>
                <img src={post.image} alt={post.title} style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)'}} />
                <span className="badge" style={{position: 'absolute', top: '15px', left: '15px', background: 'var(--primary)', color: '#fff'}}>{post.category}</span>
              </div>
              <div className="card-content" style={{padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                <span style={{color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px', display: 'block'}}>{post.date}</span>
                <h3 className="card-title" style={{fontSize: '1.2rem', marginBottom: '10px'}}>{post.title}</h3>
                <p className="card-desc" style={{flexGrow: 1}}>{post.excerpt}</p>
                <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--border-color)'}}>
                  <Link to={`/blog`} className="btn btn-outline btn-sm" style={{width: '100%', textAlign: 'center'}}>Read More</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
