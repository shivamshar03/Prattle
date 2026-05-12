import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

// Admin credentials — in production, use Firebase Auth or server-side validation
const ADMIN_CREDENTIALS = {
  username: 'shivam',
  password: 'admin'
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('prattle_admin');
    if (saved) {
      try {
        setAdmin(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem('prattle_admin');
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = (username, password) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const adminData = {
        username,
        role: 'superadmin',
        loggedInAt: new Date().toISOString()
      };
      sessionStorage.setItem('prattle_admin', JSON.stringify(adminData));
      setAdmin(adminData);
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const adminLogout = () => {
    sessionStorage.removeItem('prattle_admin');
    setAdmin(null);
  };

  if (loading) return null;

  return (
    <AdminContext.Provider value={{ admin, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
