import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar as CalIcon, Plus, Users } from 'lucide-react';

const Meetups = () => {
  const navigate = useNavigate();
  // Using local state to mock
  const [meetups] = useState([
    { id: 1, title: 'Startup Networking Coffee', location: 'Caffeine Rush, Palasia', time: 'Today, 6:00 PM', host: 'NeonGhost99', attendees: 4, desc: 'Casual discussion about tech in Indore.' },
    { id: 2, title: 'Group Workout & Run', location: 'Nehru Stadium', time: 'Tomorrow, 6:00 AM', host: 'FitnessFreak21', attendees: 8, desc: 'Morning 5k run followed by basic workout.' }
  ]);

  return (
    <div className="fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Meetups in Indore</h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Real life, real fast.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate('/meetups/create')}
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid-list">
        {meetups.map((m, i) => (
          <div key={m.id} className="glass-panel" style={{ padding: '1.25rem', animation: 'slideUp 0.3s ease forwards', animationDelay: `${i * 0.1}s`, opacity: 0 }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{m.title}</h3>
            <p className="text-muted" style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>{m.desc}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} /> {m.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <CalIcon size={16} style={{ color: 'var(--secondary)' }} /> {m.time}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Users size={16} /> Hosted by {m.host} • {m.attendees} going
              </div>
            </div>

            <button 
              className="btn-outline" 
              style={{ width: '100%', padding: '0.6rem' }}
              onClick={() => alert(`Requested to join ${m.title}!`)}
            >
              Request to Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Meetups;
