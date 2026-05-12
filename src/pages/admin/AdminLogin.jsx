import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../store/AdminContext';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Both fields are required');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = adminLogin(username.trim(), password);
      if (result.success) {
        navigate('/admin');
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', background: 'linear-gradient(135deg, #09090b 0%, #1a0a2e 50%, #09090b 100%)'
    }}>
      <div className="glass-panel slide-up" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Prattle Admin" style={{ height: '80px', margin: '0 auto 1.25rem auto', display: 'block' }} />
          <p style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Chat. Connect. Explore.</p>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', color: 'var(--text-main)' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Prattle Control Center
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#ef4444'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Username
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  padding: '0.25rem', display: 'flex'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '600',
              background: loading ? 'var(--surface-light)' : 'linear-gradient(135deg, #ef4444, #f97316)',
              color: 'white', border: 'none', borderRadius: '9999px', cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.3s', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1.5rem', lineHeight: '1.5' }}>
          🔒 This is a restricted area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
