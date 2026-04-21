import React from 'react';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Info, Mail, Heart, ChevronRight, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const myCircles = [
    { id: 1, name: 'CosmicOwl404', lastMessage: 'See ya later!' },
    { id: 2, name: 'NeonGhost99', lastMessage: 'That was fun.' }
  ];

  return (
    <div className="fade-in">
      <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem auto',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
        }}>
          👽
        </div>
        <h2 style={{ marginBottom: '0.2rem' }}>{user.username}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {user.interests && user.interests.map(vibe => (
            <span key={vibe} style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)',
              padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.8rem'
            }}>
              {vibe}
            </span>
          ))}
        </div>
        <button onClick={logout} className="btn-outline" style={{ marginTop: '1.5rem', width: '100%', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}>
          <LogOut size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Leave Identity
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Users size={20} className="text-muted" /> My Circles
        </h3>
        
        <div className="grid-list">
          {myCircles.map(circle => (
            <div key={circle.id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>{circle.name}</h4>
                <p className="text-muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>{circle.lastMessage}</p>
              </div>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Chat</button>
            </div>
          ))}
          <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Match in 1:1 to build your circle!
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>More</h3>
        <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => navigate('/about')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Info size={18} /> About Prattle</div>
            <ChevronRight size={18} className="text-muted" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => navigate('/contact')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Mail size={18} /> Contact Us</div>
            <ChevronRight size={18} className="text-muted" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => navigate('/support')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Heart size={18} /> Support Us</div>
            <ChevronRight size={18} className="text-muted" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => navigate('/guidelines')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><ShieldCheck size={18} /> Community Guidelines</div>
            <ChevronRight size={18} className="text-muted" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer' }} onClick={() => navigate('/privacy')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>Privacy Policy</div>
            <ChevronRight size={18} className="text-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
