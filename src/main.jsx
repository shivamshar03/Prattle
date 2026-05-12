import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './store/AuthContext.jsx';
import { RealtimeProvider } from './store/RealtimeContext.jsx';
import { AdminProvider } from './store/AdminContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminProvider>
      <AuthProvider>
        <RealtimeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RealtimeProvider>
      </AuthProvider>
    </AdminProvider>
  </StrictMode>,
);
