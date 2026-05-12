import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../store/AdminContext';
import { db } from '../../store/firebase';
import { ref, onValue, remove, get } from 'firebase/database';
import { Shield, Users, MessageSquare, Calendar, LogOut, Trash2, Eye, RefreshCw, Search, UserX, Hash, Mail } from 'lucide-react';

const AdminDashboard = () => {
  const { admin, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState({});
  const [channels, setChannels] = useState({});
  const [meetups, setMeetups] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ users: 0, rooms: 0, channels: 0, meetups: 0, feedback: 0 });

  // Load online users
  useEffect(() => {
    const unsub = onValue(ref(db, 'online_users'), (snap) => {
      const data = snap.val() || {};
      const list = Object.values(data);
      setUsers(list);
      setStats(p => ({ ...p, users: list.length }));
    });
    return () => unsub();
  }, []);

  // Load rooms (1:1 chats)
  useEffect(() => {
    const unsub = onValue(ref(db, 'rooms'), (snap) => {
      const data = snap.val() || {};
      setRooms(data);
      setStats(p => ({ ...p, rooms: Object.keys(data).length }));
    });
    return () => unsub();
  }, []);

  // Load channel messages
  useEffect(() => {
    const unsub = onValue(ref(db, 'channels'), (snap) => {
      const data = snap.val() || {};
      setChannels(data);
      setStats(p => ({ ...p, channels: Object.keys(data).length }));
    });
    return () => unsub();
  }, []);

  // Load meetups from Firebase
  useEffect(() => {
    const unsub = onValue(ref(db, 'meetups'), (snap) => {
      const data = snap.val() || {};
      const m = Object.values(data);
      setMeetups(m);
      setStats(p => ({ ...p, meetups: m.length }));
    });
    return () => unsub();
  }, []);

  // Load feedback from Firebase
  useEffect(() => {
    const unsub = onValue(ref(db, 'contact_messages'), (snap) => {
      const data = snap.val() || {};
      const f = Object.entries(data).map(([id, val]) => ({ id, ...val }));
      setFeedback(f);
      setStats(p => ({ ...p, feedback: f.length }));
    });
    return () => unsub();
  }, []);

  const removeUser = async (userId) => {
    if (!window.confirm('Remove this user? They will be disconnected.')) return;
    try {
      await remove(ref(db, `online_users/${userId}`));
    } catch (error) {
      alert('Failed to remove user: ' + error.message);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Delete this entire chat room and all messages?')) return;
    try {
      await remove(ref(db, `rooms/${roomId}`));
      if (selectedChat === roomId) { setSelectedChat(null); setChatMessages([]); }
    } catch (error) {
      alert('Failed to delete room: ' + error.message);
    }
  };

  const deleteChannel = async (channelId) => {
    if (!window.confirm('Delete all messages in this channel?')) return;
    try {
      await remove(ref(db, `channels/${channelId}`));
    } catch (error) {
      alert('Failed to delete channel: ' + error.message);
    }
  };

  const deleteMeetup = async (meetupId) => {
    if (!window.confirm('Delete this meetup?')) return;
    try {
      await remove(ref(db, `meetups/${meetupId}`));
    } catch (error) {
      alert('Failed to delete meetup: ' + error.message);
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await remove(ref(db, `contact_messages/${id}`));
    } catch (error) {
      alert('Failed to delete message: ' + error.message);
    }
  };

  const viewChat = async (roomId) => {
    setSelectedChat(roomId);
    const snap = await get(ref(db, `rooms/${roomId}/messages`));
    const data = snap.val() || {};
    const msgs = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    setChatMessages(msgs);
  };

  const viewChannelChat = async (channelId) => {
    setSelectedChat(`channel_${channelId}`);
    const snap = await get(ref(db, `channels/${channelId}/messages`));
    const data = snap.val() || {};
    const msgs = Object.values(data).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    setChatMessages(msgs);
  };

  const handleLogout = () => { adminLogout(); navigate('/'); };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.gender?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'users', label: 'Users', icon: <Users size={18} />, count: stats.users },
    { id: 'chats', label: 'Chats', icon: <MessageSquare size={18} />, count: stats.rooms },
    { id: 'channels', label: 'Channels', icon: <Hash size={18} />, count: stats.channels },
    { id: 'meetups', label: 'Meetups', icon: <Calendar size={18} />, count: stats.meetups },
    { id: 'feedback', label: 'Contact Us', icon: <Mail size={18} />, count: stats.feedback },
  ];

  const sty = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #09090b, #1a0a2e 60%, #09090b)', color: '#f8fafc' },
    header: { padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50 },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' },
    card: { background: 'rgba(24,24,27,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(8px)' },
    stat: { background: 'rgba(24,24,27,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', flex: 1, minWidth: '120px' },
    badge: (color) => ({ background: `${color}20`, color, padding: '0.15rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 600 }),
    btnDanger: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.4rem 0.7rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' },
    btnView: { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', padding: '0.4rem 0.7rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' },
  };

  return (
    <div style={sty.page}>
      {/* Header */}
      <div style={sty.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={24} color="#ef4444" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Prattle Admin</h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#a1a1aa' }}>Logged in as {admin?.username}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ ...sty.btnDanger, padding: '0.5rem 1rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={sty.content}>
        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Online Users', value: stats.users, color: '#22c55e', icon: '🟢' },
            { label: 'Chat Rooms', value: stats.rooms, color: '#8b5cf6', icon: '💬' },
            { label: 'Channels', value: stats.channels, color: '#3b82f6', icon: '#️⃣' },
            { label: 'Meetups', value: stats.meetups, color: '#f97316', icon: '📅' },
            { label: 'Contact Us', value: stats.feedback, color: '#eab308', icon: '✉️' },
          ].map(s => (
            <div key={s.label} style={sty.stat}>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, marginBottom: '0.25rem' }}>{s.icon} {s.value}</p>
              <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedChat(null); setChatMessages([]); }} style={{
              padding: '0.6rem 1.1rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', border: 'none',
              background: tab === t.id ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(39,39,42,0.8)',
              color: tab === t.id ? 'white' : '#a1a1aa'
            }}>
              {t.icon} {t.label} <span style={sty.badge(tab === t.id ? '#fff' : '#8b5cf6')}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* USERS TAB */}
        {tab === 'users' && (
          <div>
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
              <input className="input-field" placeholder="Search users by name or gender..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
            </div>
            {filteredUsers.length === 0 ? (
              <div style={{ ...sty.card, textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>
                <Users size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} /><p>No users online</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.6rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                {filteredUsers.map(u => (
                  <div key={u.id} style={{ ...sty.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{u.username}</span>
                        {u.gender && <span style={sty.badge('#ec4899')}>{u.gender}</span>}
                        {u.age && <span style={sty.badge('#3b82f6')}>{u.age}y</span>}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: 0 }}>ID: {u.id?.slice(0, 8)}...</p>
                      {u.interests?.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                          {u.interests.slice(0, 3).map(i => <span key={i} style={{ fontSize: '0.68rem', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>{i}</span>)}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeUser(u.id)} style={sty.btnDanger}><UserX size={14} /> Kick</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHATS TAB */}
        {tab === 'chats' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedChat ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div>
              <h4 style={{ marginBottom: '0.75rem', color: '#a1a1aa', fontSize: '0.85rem' }}>Active Chat Rooms ({Object.keys(rooms).length})</h4>
              {Object.keys(rooms).length === 0 ? (
                <div style={{ ...sty.card, textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>No active chats</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                  {Object.entries(rooms).sort((a, b) => {
                    const aMsgs = Object.values(a[1].messages || {});
                    const bMsgs = Object.values(b[1].messages || {});
                    const aLatest = aMsgs.length > 0 ? aMsgs[aMsgs.length - 1].timestamp || 0 : 0;
                    const bLatest = bMsgs.length > 0 ? bMsgs[bMsgs.length - 1].timestamp || 0 : 0;
                    if (bLatest !== aLatest) return bLatest - aLatest; // Newest first
                    return a[0].localeCompare(b[0]); // Fallback to alphabetic by roomId
                  }).map(([roomId, room]) => {
                    const msgCount = room.messages ? Object.keys(room.messages).length : 0;
                    const usersSet = new Set();
                    let latestTime = '';
                    if (room.messages) {
                      Object.values(room.messages).forEach(m => {
                        if (m.user && m.user !== 'System') usersSet.add(m.user);
                        if (m.time) latestTime = m.time;
                      });
                    }
                    const usersList = Array.from(usersSet).join(' & ') || roomId.slice(0, 20) + '...';

                    return (
                      <div key={roomId} style={{ ...sty.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: selectedChat === roomId ? '1px solid #8b5cf6' : undefined }}
                        onClick={() => viewChat(roomId)}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usersList}</p>
                          <p style={{ fontSize: '0.72rem', color: '#a1a1aa', margin: '0.2rem 0 0' }}>
                            {msgCount} messages {latestTime ? `• Last active: ${latestTime}` : ''}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={(e) => { e.stopPropagation(); viewChat(roomId); }} style={sty.btnView}><Eye size={13} /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteRoom(roomId); }} style={sty.btnDanger}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Chat viewer */}
            {selectedChat && !selectedChat.startsWith('channel_') && (
              <div style={{ ...sty.card, maxHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}>💬 Chat Viewer</h4>
                  <button onClick={() => { setSelectedChat(null); setChatMessages([]); }} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Close</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {chatMessages.length === 0 ? (
                    <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>No messages in this room</p>
                  ) : chatMessages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: '0.6rem', padding: '0.5rem 0.75rem', background: 'rgba(39,39,42,0.6)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#8b5cf6' }}>{msg.user}</span>
                        <span style={{ fontSize: '0.65rem', color: '#71717a' }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', wordBreak: 'break-word' }}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHANNELS TAB */}
        {tab === 'channels' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedChat ? '1fr 1fr' : '1fr', gap: '1rem' }}>
            <div>
              <h4 style={{ marginBottom: '0.75rem', color: '#a1a1aa', fontSize: '0.85rem' }}>Channel Messages</h4>
              {Object.keys(channels).length === 0 ? (
                <div style={{ ...sty.card, textAlign: 'center', padding: '2rem', color: '#a1a1aa' }}>No channel data</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(channels).map(([chId, ch]) => {
                    const msgCount = ch.messages ? Object.keys(ch.messages).length : 0;
                    const names = { '1': 'Weekend Chill', '2': 'Cafe Hopping', '3': 'Startup & Tech', '4': 'Gym Buddies', '5': 'Late Night Talks' };
                    return (
                      <div key={chId} style={{ ...sty.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: selectedChat === `channel_${chId}` ? '1px solid #3b82f6' : undefined }}
                        onClick={() => viewChannelChat(chId)}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>#{names[chId] || chId}</p>
                          <p style={{ fontSize: '0.72rem', color: '#a1a1aa', margin: '0.2rem 0 0' }}>{msgCount} messages</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={(e) => { e.stopPropagation(); viewChannelChat(chId); }} style={sty.btnView}><Eye size={13} /></button>
                          <button onClick={(e) => { e.stopPropagation(); deleteChannel(chId); }} style={sty.btnDanger}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedChat?.startsWith('channel_') && (
              <div style={{ ...sty.card, maxHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}>#️⃣ Channel Viewer</h4>
                  <button onClick={() => { setSelectedChat(null); setChatMessages([]); }} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Close</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {chatMessages.length === 0 ? (
                    <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>No messages</p>
                  ) : chatMessages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: '0.6rem', padding: '0.5rem 0.75rem', background: 'rgba(39,39,42,0.6)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#3b82f6' }}>{msg.user}</span>
                        <span style={{ fontSize: '0.65rem', color: '#71717a' }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', wordBreak: 'break-word' }}>{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MEETUPS TAB */}
        {tab === 'meetups' && (
          <div>
            {meetups.length === 0 ? (
              <div style={{ ...sty.card, textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>
                <Calendar size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} /><p>No meetups created</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {meetups.map(m => (
                  <div key={m.id} style={sty.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{m.title}</h4>
                      <button onClick={() => deleteMeetup(m.id)} style={sty.btnDanger}><Trash2 size={13} /></button>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#a1a1aa', margin: '0 0 0.5rem' }}>{m.desc}</p>
                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span>📍 {m.location}</span>
                      <span>📅 {m.date} at {m.time}</span>
                      <span>👤 Host: {m.host}</span>
                      <span>👥 {m.attendees?.length || 0} attending</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTACT US TAB */}
        {tab === 'feedback' && (
          <div>
            {feedback.length === 0 ? (
              <div style={{ ...sty.card, textAlign: 'center', padding: '3rem', color: '#a1a1aa' }}>
                <Mail size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} /><p>No messages received</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr' }}>
                {feedback.sort((a,b) => b.timestamp - a.timestamp).map(f => (
                  <div key={f.id} style={{ ...sty.card, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{f.subject || 'No Subject'}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: 0 }}>From: {f.name} ({f.email}) • {new Date(f.timestamp).toLocaleString()}</p>
                      </div>
                      <button onClick={() => deleteFeedback(f.id)} style={sty.btnDanger}><Trash2 size={13} /></button>
                    </div>
                    <div style={{ background: 'rgba(9,9,11,0.5)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap', marginTop: '0.25rem' }}>
                      {f.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
