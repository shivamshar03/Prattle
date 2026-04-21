import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useRealtime } from '../store/RealtimeContext';
import { Search } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { subscribeOnlineUsers, findMatch, leaveMatchQueue, directMatch } = useRealtime();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeOnlineUsers((users) => setOnlineUsers(users));
    return () => unsub();
  }, [user, subscribeOnlineUsers]);

  const startDirectMatch = async (targetUser) => {
    const result = await directMatch(targetUser, user);
    if (result) {
      navigate('/chat/random', { state: { room: result.room, stranger: result.stranger } });
    }
  };

  useEffect(() => {
    return () => {
      if (isSearching) {
        leaveMatchQueue(user.id);
      }
    };
  }, [isSearching, user?.id, leaveMatchQueue]);

  const startMatchmaking = async () => {
    setIsSearching(true);
    const result = await findMatch(user);
    if (result) {
      setIsSearching(false);
      navigate('/chat/random', { state: { room: result.room, stranger: result.stranger } });
    }
    // If null, we're in the queue — Layout.jsx will catch the match via subscribeToMatchRequests
  };

  return (
    <div className="fade-in">
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Hey, {user.username} ✌️</h2>
        <p className="text-muted">Ready to vibe in Indore?</p>
      </div>

      <div className="glass-panel text-center" style={{ padding: '3rem 1.5rem', border: '1px solid var(--primary)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div 
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
              animation: isSearching ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            <Search size={32} color="white" />
          </div>
        </div>
        <h3 style={{ marginBottom: '1rem' }}>
          {isSearching ? 'Finding someone cool...' : '1:1 Random Chat'}
        </h3>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Connect securely. 15 minute sessions. Trust first.
        </p>
        <button 
          className="btn-primary" 
          style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }}
          onClick={startMatchmaking}
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Start Session'}
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(139, 92, 246, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
      `}} />

      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
          🟢 {onlineUsers.length} Users Online
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {onlineUsers.filter(u => u.username !== user.username).map(u => (
            <span 
              key={u.id} 
              onClick={() => startDirectMatch(u)}
              style={{ 
                backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                border: '1px solid var(--border-color)',
                padding: '0.3rem 0.6rem', 
                borderRadius: '1rem', 
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'; }}
            >
              {u.username}
            </span>
          ))}
          {onlineUsers.filter(u => u.username !== user.username).length === 0 && <span className="text-muted" style={{ fontSize: '0.85rem' }}>Just you and the void...</span>}
        </div>
      </div>
    </div>
  );
};

export default Home;
