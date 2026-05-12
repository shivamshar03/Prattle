import React, { useState } from 'react';
import { Heart, Copy, Check, Coffee, Code, Shield } from 'lucide-react';

const Support = () => {
  const upi = 'prattle@upi';
  const [copied, setCopied] = useState(false);

  const copyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = upi;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Heart size={48} color="var(--secondary)" style={{ margin: '0 auto 1rem auto', display: 'block' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Support Prattle</h2>
        <p className="text-muted">Help us keep Indore connected. Every contribution matters.</p>
      </div>

      {/* UPI Card */}
      <div className="glass-panel text-center" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Donate via UPI</h3>
        <div style={{ width: '150px', height: '150px', backgroundColor: 'white', margin: '0 auto 1.25rem auto', padding: '8px', borderRadius: '12px' }}>
          <div style={{ width: '100%', height: '100%', background: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 12px 12px', borderRadius: '8px' }}></div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          backgroundColor: 'var(--surface-light)', padding: '0.75rem 1rem', borderRadius: '12px',
          margin: '0 auto', maxWidth: '250px'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{upi}</span>
          <button
            onClick={copyUPI}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
              color: copied ? '#22c55e' : 'var(--primary)', transition: 'color 0.2s'
            }}
            title={copied ? 'Copied!' : 'Copy UPI ID'}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        {copied && <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '0.5rem' }}>Copied to clipboard!</p>}
      </div>

      {/* Why Support */}
      <h3 style={{ marginBottom: '1rem' }}>Where your support goes</h3>
      <div className="grid-list">
        {[
          { icon: <Code size={24} color="var(--primary)" />, title: 'Development', desc: 'Server costs, infrastructure, and new feature development.' },
          { icon: <Shield size={24} color="#22c55e" />, title: 'Safety & Moderation', desc: 'Building tools to keep the community safe and welcoming.' },
          { icon: <Coffee size={24} color="var(--secondary)" />, title: 'Community Events', desc: 'Sponsoring real-world meetups and community gatherings in Indore.' },
        ].map((item, i) => (
          <div key={i} className="glass-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-light)', borderRadius: '12px', flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>{item.title}</h4>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
