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
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (interests) => {
    const newUser = {
      id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2),
      username: generateUsername(),
      interests,
      joinedAt: new Date().toISOString()
    };
    localStorage.setItem('prattle_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('prattle_user');
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
