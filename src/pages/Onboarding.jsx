import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const Onboarding = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedVibes, setSelectedVibes] = useState([]);

  const vibes = [
    'Chill', 'Deep Talks', 'Gaming', 'Tech/Startup', 
    'Movies', 'Music', 'Fitness', 'Foodie'
  ];

  const toggleVibe = (vibe) => {
    setSelectedVibes(prev => 
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
  };

  const handleJoin = () => {
    
    login(selectedVibes);
    navigate('/');
  };

  return (
    <div className="app-container fade-in" style={{ justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel text-center slide-up">
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Prattle</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Anonymous to real connections in Indore.</p>
        
        <h3 style={{ marginBottom: '1rem', textAlign: 'left' }}>Select your vibes (optional)</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {vibes.map(vibe => (
            <button
              key={vibe}
              onClick={() => toggleVibe(vibe)}
              className={`btn-outline ${selectedVibes.includes(vibe) ? 'active' : ''}`}
              style={{
                backgroundColor: selectedVibes.includes(vibe) ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                borderColor: selectedVibes.includes(vibe) ? 'var(--primary)' : 'var(--border-color)',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem'
              }}
            >
              {vibe}
            </button>
          ))}
        </div>

        <button className="btn-primary" style={{ width: '100%', fontSize: '1.2rem' }} onClick={handleJoin}>
          Generate Identity & Enter
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
