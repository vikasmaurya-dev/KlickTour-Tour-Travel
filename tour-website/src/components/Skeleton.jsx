import React from 'react';
import './Skeleton.css';

const Skeleton = ({ width, height, variant = 'box', className = '', style = {} }) => {
  const baseClass = `skeleton-base skeleton-${variant} ${className}`;
  
  const customStyle = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
    ...style
  };

  return <div className={baseClass} style={customStyle} />;
};

export const CardSkeleton = () => (
  <div className="skeleton-card">
    <Skeleton height="240px" className="skeleton-card-img" />
    <div className="skeleton-card-content">
      <Skeleton width="70%" height="24px" />
      <Skeleton width="40%" height="16px" />
      <div style={{ marginTop: 'auto' }}>
        <Skeleton width="100%" height="40px" />
      </div>
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="container" style={{ paddingTop: '100px', marginBottom: '80px' }}>
    <Skeleton height="450px" style={{ borderRadius: '20px', marginBottom: '40px' }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
      <div className="space-y-4">
        <Skeleton width="60%" height="40px" />
        <Skeleton width="90%" height="20px" style={{ marginBottom: '10px' }} />
        <Skeleton width="95%" height="20px" style={{ marginBottom: '10px' }} />
        <Skeleton width="85%" height="20px" style={{ marginBottom: '40px' }} />
        <Skeleton height="200px" style={{ borderRadius: '12px' }} />
      </div>
      <div className="space-y-4">
        <Skeleton height="400px" style={{ borderRadius: '15px' }} />
      </div>
    </div>
  </div>
);

export const BookingSkeleton = () => (
  <div className="container" style={{ paddingTop: '100px', marginBottom: '80px' }}>
    <Skeleton width="300px" height="40px" style={{ marginBottom: '40px' }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px' }}>
      <div className="card" style={{ padding: '30px' }}>
        <Skeleton width="150px" height="24px" style={{ marginBottom: '25px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div><Skeleton width="100px" height="14px" style={{ marginBottom: '8px' }} /><Skeleton height="45px" /></div>
          <div><Skeleton width="100px" height="14px" style={{ marginBottom: '8px' }} /><Skeleton height="45px" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div><Skeleton width="100px" height="14px" style={{ marginBottom: '8px' }} /><Skeleton height="45px" /></div>
          <div><Skeleton width="100px" height="14px" style={{ marginBottom: '8px' }} /><Skeleton height="45px" /></div>
        </div>
        <Skeleton width="100px" height="14px" style={{ marginBottom: '8px' }} /><Skeleton height="100px" />
      </div>
      <div>
        <div className="card" style={{ padding: '25px' }}>
          <Skeleton width="180px" height="24px" style={{ marginBottom: '20px' }} />
          <Skeleton width="90%" height="16px" style={{ marginBottom: '15px' }} />
          <div style={{ borderTop: '1px solid #eee', marginTop: '20px', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <Skeleton width="100px" height="14px" /><Skeleton width="60px" height="14px" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width="100px" height="14px" /><Skeleton width="60px" height="14px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="card" style={{ display: 'flex', padding: '15px', gap: '20px' }}>
        <Skeleton width="120px" height="100px" style={{ borderRadius: '8px', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40%" height="14px" />
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <Skeleton width="80px" height="14px" />
            <Skeleton width="80px" height="14px" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const RouteSkeleton = ({ count = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
    {[...Array(count)].map((_, i) => (
      <div key={i} className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '200px' }}>
          <Skeleton variant="circle" width="40px" height="40px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="100px" height="16px" style={{ marginBottom: '6px' }} />
            <Skeleton width="80px" height="12px" />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}><Skeleton width="60px" height="20px" /><Skeleton width="80px" height="12px" /></div>
          <div style={{ flex: 1, height: '2px', backgroundColor: '#eee', position: 'relative' }}></div>
          <div style={{ textAlign: 'center' }}><Skeleton width="60px" height="20px" /><Skeleton width="80px" height="12px" /></div>
        </div>
        <div style={{ width: '100px', textAlign: 'right' }}>
          <Skeleton width="80px" height="24px" />
        </div>
        <Skeleton width="100px" height="40px" style={{ borderRadius: '8px' }} />
      </div>
    ))}
  </div>
);

export default Skeleton;
