import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useRealtime } from '../store/RealtimeContext';
import { Search, X, Users as UsersIcon, Zap } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { subscribeOnlineUsers, findMatch, leaveMatchQueue, directMatch, sendMessage, subscribeToMatchRequests } = useRealtime();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const isSearchingRef = React.useRef(isSearching);
  React.useEffect(() => { isSearchingRef.current = isSearching; }, [isSearching]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingChatReq, setIncomingChatReq] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsubMatch = subscribeToMatchRequests(user.id, (matchData) => {
      if (isSearchingRef.current) {
        setIsSearching(false);
        navigate('/chat/random', { state: { room: matchData.room, stranger: matchData.fromUser } });
      } else {
        setIncomingChatReq(matchData);
      }
    });
    const unsubOnline = subscribeOnlineUsers((users) => setOnlineUsers(users));
    
    return () => {
      unsubMatch();
      unsubOnline();
    };
  }, [user, subscribeToMatchRequests, subscribeOnlineUsers, navigate]);

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
  };

  const cancelSearch = async () => {
    setIsSearching(false);
    await leaveMatchQueue(user.id);
  };

  const otherUsers = onlineUsers.filter(u => u.username !== user.username);

  return (
    <div className="fade-in">
      {/* Welcome Card */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Hey, {user.username} ✌️</h2>
        <p className="text-muted">Ready to vibe in Indore?</p>
        {user.interests && user.interests.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
            {user.interests.map(v => (
              <span key={v} style={{
                backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary)',
                padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem'
              }}>{v}</span>
            ))}
          </div>
        )}
      </div>

      {/* Matchmaker Card */}
      <div className="glass-panel text-center" style={{ padding: '3rem 1.5rem', border: '1px solid var(--primary)', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: isSearching
                ? 'linear-gradient(135deg, var(--secondary), var(--primary))'
                : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
              animation: isSearching ? 'pulse 1.5s infinite' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {isSearching ? <Zap size={32} color="white" /> : <Search size={32} color="white" />}
          </div>
        </div>
        <h3 style={{ marginBottom: '0.5rem' }}>
          {isSearching ? 'Finding someone cool...' : '1:1 Random Chat'}
        </h3>
        <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '0.9rem' }}>
          Connect securely. 15 minute sessions. Trust first.
        </p>

        {isSearching ? (
          <button
            className="btn-outline"
            style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', borderColor: 'var(--secondary)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={cancelSearch}
          >
            <X size={20} /> Cancel Search
          </button>
        ) : (
          <button
            className="btn-primary"
            style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
            onClick={startMatchmaking}
          >
            Start Session
          </button>
        )}
      </div>

      {/* Online Users */}
      <div className="glass-panel">
        <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UsersIcon size={18} />
          <span>🟢 {onlineUsers.length} Online</span>
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {otherUsers.map(u => {
            const genderEmoji = { 'Male': '♂️', 'Female': '♀️', 'Non-binary': '⚧️' }[u.gender] || '';
            return (
            <span
              key={u.id}
              onClick={() => startDirectMatch(u)}
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid var(--border-color)',
                padding: '0.4rem 0.8rem',
                borderRadius: '2rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.3)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              title={`Click to chat with ${u.username}`}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
              {u.username}
              {genderEmoji && <span style={{ fontSize: '0.7rem' }}>{genderEmoji}</span>}
              {u.age && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.age}</span>}
            </span>
            );
          })}
          {otherUsers.length === 0 && (
            <p className="text-muted" style={{ fontSize: '0.85rem', width: '100%', textAlign: 'center', padding: '1rem 0' }}>
              No other users online yet. Share Prattle with friends!
            </p>
          )}
        </div>
      </div>

      {/* Incoming Chat Request Popup */}
      {incomingChatReq && (
        <div className="fade-in" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(9, 9, 11, 0.85)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--surface-light)', padding: '2rem', borderRadius: '16px',
            textAlign: 'center', maxWidth: '320px', border: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Chat Request</h3>
            <p style={{ margin: '0 0 2rem 0', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--primary)' }}>{incomingChatReq.fromUser.username}</strong> wants to chat with you!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn-outline" 
                onClick={() => {
                  sendMessage(incomingChatReq.room, `${user.username} rejected the chat request.`, 'System');
                  setIncomingChatReq(null);
                }} 
                style={{ borderColor: '#ef4444', color: '#ef4444', flex: 1, padding: '0.8rem' }}
              >
                No
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  navigate('/chat/random', { state: { room: incomingChatReq.room, stranger: incomingChatReq.fromUser } });
                  setIncomingChatReq(null);
                }} 
                style={{ flex: 1, padding: '0.8rem' }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html:`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(139, 92, 246, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
      `}} />
    </div>
  );
};

export default Home;
