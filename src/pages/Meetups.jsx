import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useRealtime } from '../store/RealtimeContext';
import { MapPin, Calendar as CalIcon, Plus, Users, Clock, ArrowLeft } from 'lucide-react';

const Meetups = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meetups, setMeetups] = useState(() => {
    const saved = localStorage.getItem('prattle_meetups');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: 'Startup Networking Coffee', location: 'Caffeine Rush, Palasia', date: '2026-05-15', time: '18:00', host: 'NeonGhost99', attendees: ['NeonGhost99'], desc: 'Casual discussion about tech in Indore.' },
      { id: 2, title: 'Group Workout & Run', location: 'Nehru Stadium', date: '2026-05-16', time: '06:00', host: 'FitnessFreak21', attendees: ['FitnessFreak21'], desc: 'Morning 5k run followed by basic workout.' }
    ];
  });

  const joinMeetup = (meetupId) => {
    setMeetups(prev => {
      const updated = prev.map(m => {
        if (m.id === meetupId) {
          if (m.attendees.includes(user.username)) return m;
          return { ...m, attendees: [...m.attendees, user.username] };
        }
        return m;
      });
      localStorage.setItem('prattle_meetups', JSON.stringify(updated));
      return updated;
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Meetups in Indore</h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Real life, real fast.</p>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '0.6rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
          onClick={() => navigate('/meetups/create')}
        >
          <Plus size={18} /> Create
        </button>
      </div>

      {meetups.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '3rem' }}>
          <CalIcon size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No meetups yet</h3>
          <p className="text-muted">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid-list">
          {meetups.map((m, i) => {
            const isJoined = m.attendees.includes(user.username);
            const isHost = m.host === user.username;
            return (
              <div key={m.id} className="glass-panel" style={{ padding: '1.25rem', animation: 'slideUp 0.3s ease forwards', animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{m.title}</h3>
                  {isHost && (
                    <span style={{ backgroundColor: 'rgba(139,92,246,0.2)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '600' }}>HOST</span>
                  )}
                </div>
                <p className="text-muted" style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>{m.desc}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} /> {m.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <CalIcon size={15} style={{ color: 'var(--secondary)', flexShrink: 0 }} /> {formatDate(m.date)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Clock size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {formatTime(m.time)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Users size={15} style={{ flexShrink: 0 }} /> {m.attendees.length} going • Hosted by {m.host}
                  </div>
                </div>

                <button
                  className={isJoined ? 'btn-primary' : 'btn-outline'}
                  style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem', opacity: isJoined ? 0.7 : 1 }}
                  onClick={() => !isJoined && joinMeetup(m.id)}
                  disabled={isJoined}
                >
                  {isJoined ? '✓ Joined' : 'Request to Join'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Meetups;
