import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { ArrowLeft, RefreshCw, Check, AlertCircle } from 'lucide-react';

const adjectives = ['Cosmic', 'Neon', 'Silent', 'Midnight', 'Electric', 'Ghost', 'Chill', 'Wild', 'Rogue', 'Wandering', 'Vibe', 'Zen', 'Shadow', 'Crystal', 'Lunar'];
const nouns = ['Panda', 'Owl', 'Wolf', 'Fox', 'Hawk', 'Tiger', 'Shark', 'Ninja', 'Ghost', 'Rider', 'Phoenix', 'Nomad', 'Seeker', 'Rebel'];

const generateName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${Math.floor(Math.random() * 999)}`;
};

const genderOptions = [
  { value: 'Male', emoji: '♂️' },
  { value: 'Female', emoji: '♀️' },
  { value: 'Non-binary', emoji: '⚧️' },
  { value: 'Prefer not to say', emoji: '🤐' },
];

const allVibes = [
  '😎 Chill', '🧠 Deep Talks', '🎮 Gaming', '💻 Tech/Startup',
  '🎬 Movies', '🎵 Music', '💪 Fitness', '🍕 Foodie',
  '📚 Books', '🌍 Travel', '🎨 Art', '☕ Coffee'
];

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [gender, setGender] = useState(user.gender || '');
  const [age, setAge] = useState(String(user.age || ''));
  const [interests, setInterests] = useState(user.interests || []);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const toggleVibe = (vibe) => {
    setInterests(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleSave = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username cannot be empty';
    if (!gender) newErrors.gender = 'Please select your gender';
    if (!age || isNaN(age) || Number(age) < 18) newErrors.age = 'Must be 18 or older';
    if (Number(age) > 100) newErrors.age = 'Please enter a valid age';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateUser({
      username: username.trim(),
      gender,
      age: Number(age),
      interests,
    });

    setSaved(true);
    setTimeout(() => {
      navigate('/profile');
    }, 800);
  };

  return (
    <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '1rem', borderBottom: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')} />
          <h3 style={{ margin: 0 }}>Edit Identity</h3>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          onClick={handleSave}
        >
          {saved ? <><Check size={16} /> Saved!</> : 'Save'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {/* Avatar & Name */}
        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 0.75rem auto',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem'
            }}>
              👽
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Anonymous Username
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError('username'); }}
              style={{ flex: 1, borderColor: errors.username ? '#ef4444' : undefined }}
            />
            <button
              onClick={() => setUsername(generateName())}
              style={{
                background: 'var(--surface-light)', border: '1px solid var(--border-color)',
                borderRadius: '12px', padding: '0 0.75rem', cursor: 'pointer', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', transition: 'all 0.2s'
              }}
              title="Generate random name"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          {errors.username && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>{errors.username}</p>}
        </div>

        {/* Gender */}
        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Gender <span style={{ color: 'var(--secondary)', fontSize: '0.7rem' }}>*required</span>
          </h4>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {genderOptions.map(g => (
              <button
                key={g.value}
                onClick={() => { setGender(g.value); clearError('gender'); }}
                className="btn-outline"
                style={{
                  backgroundColor: gender === g.value ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  borderColor: gender === g.value ? 'var(--primary)' : 'var(--border-color)',
                  color: gender === g.value ? 'var(--primary)' : 'var(--text-main)',
                  padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '2rem'
                }}
              >
                {g.emoji} {g.value}
              </button>
            ))}
          </div>
          {errors.gender && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertCircle size={13} /> {errors.gender}
            </p>
          )}
        </div>

        {/* Age */}
        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Age <span style={{ color: 'var(--secondary)', fontSize: '0.7rem' }}>*must be 18+</span>
          </h4>
          <input
            type="number"
            className="input-field"
            value={age}
            min="18"
            max="100"
            onChange={(e) => { setAge(e.target.value); clearError('age'); }}
            style={{ maxWidth: '140px', borderColor: errors.age ? '#ef4444' : undefined }}
          />
          {errors.age && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertCircle size={13} /> {errors.age}
            </p>
          )}
        </div>

        {/* Vibes */}
        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>Your Vibes</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {allVibes.map(vibe => (
              <button
                key={vibe}
                onClick={() => toggleVibe(vibe)}
                className="btn-outline"
                style={{
                  backgroundColor: interests.includes(vibe) ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  borderColor: interests.includes(vibe) ? 'var(--primary)' : 'var(--border-color)',
                  color: interests.includes(vibe) ? 'var(--primary)' : 'var(--text-main)',
                  padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '2rem'
                }}
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="glass-panel" style={{ backgroundColor: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.15)' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0, lineHeight: '1.6' }}>
            💡 Changes to your username take effect immediately. Your gender and age help us maintain a safe community but are not displayed publicly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
