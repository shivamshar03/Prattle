import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, Users } from 'lucide-react';

const defaultChannels = [
  { id: '1', name: 'Weekend Chill', members: 142, desc: 'For those relaxing weekend vibes.' },
  { id: '2', name: 'Cafe Hopping', members: 89, desc: 'Find your next favorite coffee spot.' },
  { id: '3', name: 'Startup & Tech', members: 210, desc: 'Indore tech scene, networking & building.' },
  { id: '4', name: 'Gym Buddies', members: 56, desc: 'Need a spotter or workout partner?' },
  { id: '5', name: 'Late Night Talks', members: 320, desc: 'Deep conversations past midnight.' }
];

const Channels = () => {
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.2rem' }}>Community Channels</h2>
        <p className="text-muted">Join the conversation instantly.</p>
      </div>

      <div className="grid-list">
        {defaultChannels.map((channel, i) => (
          <div 
            key={channel.id} 
            className="glass-panel" 
            style={{ 
              padding: '1.25rem', 
              cursor: 'pointer', 
              transition: 'transform 0.2s',
              animation: `slideUp 0.3s ease forwards`,
              animationDelay: `${i * 0.05}s`,
              opacity: 0
            }}
            onClick={() => navigate(`/channels/${channel.id}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash className="text-muted" size={20} />
                <h3 style={{ margin: 0 }}>{channel.name}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Users size={14} />
                <span>{channel.members}</span>
              </div>
            </div>
            <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
              {channel.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Channels;
