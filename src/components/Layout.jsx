import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Calendar, User, Info, Mail, Heart } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useRealtime } from '../store/RealtimeContext';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribeToMatchRequests } = useRealtime();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMatchRequests(user.id, (matchData) => {
      navigate('/chat/random', { state: { room: matchData.room, stranger: matchData.fromUser } });
    });
    return () => unsub();
  }, [user, subscribeToMatchRequests, navigate]);

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Prattle';
      case '/channels': return 'Community';
      case '/meetups': return 'Meetups';
      case '/profile': return 'My Vibe';
      case '/contact': return 'Contact';
      case '/support': return 'Support Us';
      default: return 'Prattle';
    }
  };

  const immersiveRoutes = ['/chat/random', '/meetups/create'];
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
        <h1 className="header-title text-gradient" style={{ fontSize: '2rem', marginBottom: '2rem', paddingLeft: '1rem' }}>Prattle</h1>
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
    </div>
  );
};

export default Layout;
