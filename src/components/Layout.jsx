import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Calendar, User, Info, Mail, Heart } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useRealtime } from '../store/RealtimeContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribeToMatchRequests, sendMessage } = useRealtime();
  const [incomingChatReq, setIncomingChatReq] = React.useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMatchRequests(user.id, (matchData) => {
      if (matchData.isQueueMatch) {
        // Auto-join if it's a matchmaking queue result
        navigate('/chat/random', { state: { room: matchData.room, stranger: matchData.fromUser } });
      } else {
        // Otherwise it's a direct click, show popup
        setIncomingChatReq(matchData);
      }
    });
    return () => unsub();
  }, [user, subscribeToMatchRequests, navigate]);

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return <img src="/logo.png" alt="Prattle" style={{ height: '44px', display: 'block' }} />;
      case '/channels': return 'Community';
      case '/meetups': return 'Meetups';
      case '/profile': return 'My Vibe';
      case '/contact': return 'Contact';
      case '/support': return 'Support Us';
      default: return 'Prattle';
    }
  };

  const immersiveRoutes = ['/chat/random', '/meetups/create', '/profile/edit'];
  const isImmersive = immersiveRoutes.includes(location.pathname) || location.pathname.startsWith('/channels/');

  const topNavClass = isImmersive ? 'top-nav mobile-hidden' : 'top-nav';
  const bottomNavClass = isImmersive ? 'bottom-nav mobile-hidden' : 'bottom-nav';
  const mainClass = isImmersive ? 'main-content immersive-view' : 'main-content';

  const navLinks = [
    { to: '/', icon: <MessageCircle size={24} />, label: 'Chat', end: true },
    { to: '/channels', icon: <Users size={24} />, label: 'Community' },
    { to: '/meetups', icon: <Calendar size={24} />, label: 'Meetups' },
    { to: '/profile', icon: <User size={24} />, label: 'Profile' },
  ];

  const secondaryLinks = [
    { to: '/about', icon: <Info size={20} />, label: 'About Us' },
    { to: '/contact', icon: <Mail size={20} />, label: 'Contact Us' },
    { to: '/support', icon: <Heart size={20} />, label: 'Support Us' },
  ];

  return (
    <div className="app-container layout-grid fade-in">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div style={{ marginBottom: '2.5rem', paddingLeft: '1rem' }}>
          <img src="/logo.png" alt="Prattle" style={{ height: '64px' }} />
          <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--primary)', margin: '0.5rem 0 0 0', textTransform: 'uppercase' }}>Chat. Connect. Explore.</p>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              {link.icon} <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {secondaryLinks.map(link => (
            <NavLink key={link.to} to={link.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}
            >
              {link.icon} <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className={topNavClass}>
        <h1 className="header-title text-gradient">{getTitle()}</h1>
      </header>

      {/* Main Content Area */}
      <main className={mainClass}>
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className={bottomNavClass}>
        {navLinks.map(link => (
          <NavLink key={link.to} to={link.to} end={link.end}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Incoming Chat Request Popup (Global) */}
      {incomingChatReq && (
        <div className="fade-in" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(9, 9, 11, 0.85)', zIndex: 10000,
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
    </div>
  );
};

export default Layout;
