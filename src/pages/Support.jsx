import React from 'react';
import { Heart, Copy } from 'lucide-react';

const Support = () => {
  const upi = 'prattle@upi';
  return (
    <div className="fade-in" style={{ padding: '1rem', textAlign: 'center' }}>
      <Heart size={48} color="var(--secondary)" style={{ margin: '1rem auto' }} />
      <h2 style={{ marginBottom: '0.5rem' }}>Support Prattle</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Help us keep Indore connected.</p>
      
      <div className="glass-panel" style={{ display: 'inline-block', padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ width: '150px', height: '150px', backgroundColor: 'white', margin: '0 auto 1rem auto', padding: '0.5rem' }}>
          <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, #000, #000 10px, #fff 10px, #fff 20px)' }}></div>
        </div>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
          {upi} <Copy size={16} style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => alert('UPI details copied!')} />
        </p>
      </div>
    </div>
  );
};
export default Support;
