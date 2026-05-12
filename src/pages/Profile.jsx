import React from 'react';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Info, Mail, Heart, ChevronRight, ShieldCheck, Lock, MessageCircle, Edit3, Trash2 } from 'lucide-react';

const Profile = () => {
  const { user, logout, removeFromCircle } = useAuth();
  const navigate = useNavigate();

  const circles = user.circles || [];

  const genderEmoji = {
    'Male': '♂️', 'Female': '♀️', 'Non-binary': '⚧️', 'Prefer not to say': '🤐'
  };

  const menuItems = [
    { icon: <Info size={18} />, label: 'About Prattle', path: '/about' },
    { icon: <Mail size={18} />, label: 'Contact Us', path: '/contact' },
    { icon: <Heart size={18} />, label: 'Support Us', path: '/support' },
    { icon: <ShieldCheck size={18} />, label: 'Community Guidelines', path: '/guidelines' },
    { icon: <Lock size={18} />, label: 'Privacy Policy', path: '/privacy' },
  ];

  return (
    <div className="fade-in">
      {/* Profile Card */}
      <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem auto',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
        }}>
          👽
        </div>
        <h2 style={{ marginBottom: '0.25rem' }}>{user.username}</h2>

        {/* Gender & Age badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {user.gender && (
            <span style={{
              backgroundColor: 'rgba(236, 72, 153, 0.15)', color: 'var(--secondary)',
              padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '500'
            }}>
              {genderEmoji[user.gender] || ''} {user.gender}
            </span>
          )}
          {user.age && (
            <span style={{
              backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa',
              padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '500'
            }}>
              🎂 {user.age} yrs
            </span>
          )}
        </div>

        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          Joined {new Date(user.joinedAt).toLocaleDateString()}
        </p>

        {user.interests && user.interests.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {user.interests.map(vibe => (
              <span key={vibe} style={{
                backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)',
                padding: '0.2rem 0.65rem', borderRadius: '1rem', fontSize: '0.72rem'
              }}>
                {vibe}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/profile/edit')}
            className="btn-outline"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            <Edit3 size={15} /> Edit Identity
          </button>
          <button
            onClick={logout}
            className="btn-outline"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
          >
            <LogOut size={15} /> Leave
          </button>
        </div>
      </div>

      {/* Circles */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Users size={20} className="text-muted" /> My Circles ({circles.length})
        </h3>

        {circles.length > 0 ? (
          <div className="grid-list">
            {circles.map((circle, i) => (
              <div key={circle.username + i} className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{circle.username}</h4>
                    <p className="text-muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem' }}>
                      Added {new Date(circle.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                    onClick={() => {
                      const roomId = `circle_${user.id}_${circle.username}_${Date.now()}`;
                      navigate('/chat/random', { state: { room: roomId, stranger: circle } });
                    }}
                  >
                    <MessageCircle size={13} /> Chat
                  </button>
                  <button
                    className="btn-outline"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.78rem', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    onClick={() => {
                      if (confirm(`Remove ${circle.username} from your circle?`)) {
                        removeFromCircle(circle.username);
                      }
                    }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem' }}>No circles yet</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Match in 1:1 chat and add people to your circle!</p>
          </div>
        )}
      </div>

      {/* Menu Links */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>More</h3>
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          {menuItems.map((item, i) => (
            <div
              key={item.path}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem', cursor: 'pointer',
                borderBottom: i < menuItems.length - 1 ? '1px solid var(--border-color)' : 'none',
                transition: 'background 0.2s'
              }}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>{item.icon} {item.label}</div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
