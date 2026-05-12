import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const generateUsername = () => {
  const adjs = ['Chill', 'Silent', 'Neon', 'Cosmic', 'Midnight', 'Rogue', 'Wandering', 'Vibe'];
  const nouns = ['Panda', 'Ghost', 'Rider', 'Seeker', 'Ninja', 'Owl', 'Wolf', 'Nomad'];
  const r = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return `${r(adjs)}${r(nouns)}${Math.floor(Math.random() * 9999)}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('prattle_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // If user lacks required fields (old format), force re-onboard
        if (!parsed.gender || !parsed.age) {
          localStorage.removeItem('prattle_user');
          setUser(null);
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem('prattle_user');
      }
    }
    setLoading(false);
  }, []);

  const login = ({ username, interests = [], gender, age }) => {
    const newUser = {
      id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
      username: username || generateUsername(),
      interests: Array.isArray(interests) ? interests : [],
      gender,
      age: Number(age),
      circles: [],
      joinedAt: new Date().toISOString()
    };
    localStorage.setItem('prattle_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('prattle_user', JSON.stringify(updated));
    setUser(updated);
  };

  const addToCircle = (person) => {
    const existing = user.circles || [];
    if (existing.find(c => c.username === person.username)) return;
    const updated = { ...user, circles: [...existing, { ...person, addedAt: Date.now() }] };
    localStorage.setItem('prattle_user', JSON.stringify(updated));
    setUser(updated);
  };

  const removeFromCircle = (username) => {
    const existing = user.circles || [];
    const updated = { ...user, circles: existing.filter(c => c.username !== username) };
    localStorage.setItem('prattle_user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('prattle_user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, addToCircle, removeFromCircle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
