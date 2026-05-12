import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

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

const Onboarding = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [previewName, setPreviewName] = useState(generateName());
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState({});

  const vibes = [
    '😎 Chill', '🧠 Deep Talks', '🎮 Gaming', '💻 Tech/Startup',
    '🎬 Movies', '🎵 Music', '💪 Fitness', '🍕 Foodie',
    '📚 Books', '🌍 Travel', '🎨 Art', '☕ Coffee'
  ];

  const toggleVibe = (vibe) => {
    setSelectedVibes(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
    );
  };

  const handleJoin = () => {
    const newErrors = {};

    if (!gender) newErrors.gender = 'Please select your gender';
    if (!age) {
      newErrors.age = 'Please enter your age';
    } else if (isNaN(age) || Number(age) < 18) {
      newErrors.age = 'You must be 18 or older to use Prattle';
    } else if (Number(age) > 100) {
      newErrors.age = 'Please enter a valid age';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    login({
      username: previewName,
      interests: selectedVibes,
      gender,
      age: Number(age),
    });
    navigate('/');
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  return (
    <div className="app-container fade-in" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem', minHeight: '100vh', overflowY: 'auto' }}>
      <div className="glass-panel slide-up" style={{ maxWidth: '440px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1.25rem auto',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)',
            animation: 'pulse 2s infinite'
          }}>
            <Sparkles size={32} color="white" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Prattle</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Anonymous to real connections in Indore.</p>
        </div>

        {/* Identity Preview */}
        <div style={{
          background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '12px', padding: '0.9rem 1rem', marginBottom: '1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your anonymous identity</p>
            <p style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--primary)' }}>{previewName}</p>
          </div>
          <button
            onClick={() => setPreviewName(generateName())}
            style={{
              background: 'rgba(139, 92, 246, 0.15)', border: '1px solid var(--primary)',
              borderRadius: '10px', padding: '0.45rem', cursor: 'pointer', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}
            title="Regenerate name"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Gender Selection (Mandatory) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Gender <span style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>*required</span>
          </h3>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {genderOptions.map(g => (
              <button
                key={g.value}
                onClick={() => { setGender(g.value); clearError('gender'); }}
                className="btn-outline"
                style={{
                  backgroundColor: gender === g.value ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  borderColor: gender === g.value ? 'var(--primary)' : (errors.gender ? '#ef4444' : 'var(--border-color)'),
                  color: gender === g.value ? 'var(--primary)' : 'var(--text-main)',
                  padding: '0.4rem 0.85rem', fontSize: '0.82rem', borderRadius: '2rem',
                  transition: 'all 0.2s'
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

        {/* Age Input (Mandatory, 18+) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Age <span style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>*must be 18+</span>
          </h3>
          <input
            type="number"
            className="input-field"
            placeholder="Enter your age"
            value={age}
            min="18"
            max="100"
            onChange={(e) => { setAge(e.target.value); clearError('age'); }}
            style={{
              maxWidth: '160px',
              borderColor: errors.age ? '#ef4444' : undefined
            }}
          />
          {errors.age && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertCircle size={13} /> {errors.age}
            </p>
          )}
        </div>

        {/* Vibes */}
        <h3 style={{ marginBottom: '0.6rem', fontSize: '0.9rem' }}>Select your vibes <span className="text-muted" style={{ fontSize: '0.75rem' }}>(optional)</span></h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {vibes.map(vibe => (
            <button
              key={vibe}
              onClick={() => toggleVibe(vibe)}
              className="btn-outline"
              style={{
                backgroundColor: selectedVibes.includes(vibe) ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                borderColor: selectedVibes.includes(vibe) ? 'var(--primary)' : 'var(--border-color)',
                color: selectedVibes.includes(vibe) ? 'var(--primary)' : 'var(--text-main)',
                padding: '0.35rem 0.8rem', fontSize: '0.8rem', borderRadius: '2rem'
              }}
            >
              {vibe}
            </button>
          ))}
        </div>

        {/* Join Button */}
        <button className="btn-primary" style={{ width: '100%', fontSize: '1.05rem', padding: '0.9rem' }} onClick={handleJoin}>
          Enter as {previewName}
        </button>

        <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.72rem', marginTop: '0.8rem', lineHeight: '1.5' }}>
          No sign-up required. Stay anonymous until you're ready.<br/>
          By joining, you confirm you are 18 years or older.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
