import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Channels from './pages/Channels';
import ChannelChat from './pages/ChannelChat';
import RandomChat from './pages/RandomChat';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Meetups from './pages/Meetups';
import CreateMeetup from './pages/CreateMeetup';
import Contact from './pages/Contact';
import Support from './pages/Support';
import { About, Guidelines, Privacy } from './pages/StaticPages';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useAuth } from './store/AuthContext';
import { useAdmin } from './store/AdminContext';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/onboarding" />;
  return children;
}

function AdminRoute({ children }) {
  const { admin } = useAdmin();
  if (!admin) return <Navigate to="/admin-login/shivam" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      {/* Admin Routes */}
      <Route path="/admin-login/shivam" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      {/* User Routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="channels" element={<Channels />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="meetups" element={<Meetups />} />
        <Route path="contact" element={<Contact />} />
        <Route path="support" element={<Support />} />
        <Route path="about" element={<About />} />
        <Route path="guidelines" element={<Guidelines />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="channels/:id" element={<ChannelChat />} />
        <Route path="chat/random" element={<RandomChat />} />
        <Route path="meetups/create" element={<CreateMeetup />} />
      </Route>
    </Routes>
  );
}

export default App;
