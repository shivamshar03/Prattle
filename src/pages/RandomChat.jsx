import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, UserPlus, X, Phone, PhoneOff, PhoneCall, AlertTriangle, ShieldX } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useRealtime } from '../store/RealtimeContext';

const RandomChat = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const { sendMessage, subscribeMessages, sendSignal, subscribeSignaling } = useRealtime();
  const [messages, setMessages] = useState([]);
  const [inputBox, setInputBox] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const room = state?.room || 'test_room';
  const strangerInit = state?.stranger || { username: 'CosmicOwl404', vibe: 'Chill' };
  const [stranger] = useState(strangerInit);
  const [showCall, setShowCall] = useState(false);
  const [callStatus, setCallStatus] = useState('calling');
  const messagesEndRef = useRef(null);
  
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Session ended!');
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  // Subscribe to incoming messages
  useEffect(() => {
    const unsub = subscribeMessages(room, (msg) => {
      // Only show messages from the OTHER user (we add our own locally)
      if (msg.user !== user.username) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => unsub();
  }, [room, user.username, subscribeMessages]);

  // Subscribe to WebRTC signaling
  useEffect(() => {
    const unsub = subscribeSignaling(room, user.username, async (signal) => {
      if (signal.type === 'offer') {
        setShowCall(true);
        setCallStatus('connected');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
          peerConnectionRef.current = pc;
          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          pc.onicecandidate = (event) => {
            if (event.candidate) sendSignal(room, 'ice', event.candidate, user.username);
          };
          pc.ontrack = (event) => {
            const remoteAudio = document.getElementById('remoteAudio');
            if (remoteAudio) remoteAudio.srcObject = event.streams[0];
          };

          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(room, 'answer', answer, user.username);
        } catch (e) { console.error(e); }
      } else if (signal.type === 'answer') {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.data));
        }
      } else if (signal.type === 'ice') {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.data));
        }
      } else if (signal.type === 'end_call') {
        setShowCall(false);
        setCallStatus('calling');
        if (peerConnectionRef.current) peerConnectionRef.current.close();
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        alert(`${stranger.username} ended the call.`);
      }
    });
    return () => unsub();
  }, [room, user.username, stranger.username, sendSignal, subscribeSignaling]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputBox.trim()) return;

    const msg = {
      id: Date.now(),
      user: user.username,
      text: inputBox,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, msg]);
    sendMessage(room, inputBox, user.username);
    setInputBox('');
  };

  const startCall = async () => {
    setShowCall(true);
    setCallStatus('calling');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) sendSignal(room, 'ice', event.candidate, user.username);
      };
      pc.ontrack = (event) => {
        const remoteAudio = document.getElementById('remoteAudio');
        if (remoteAudio) remoteAudio.srcObject = event.streams[0];
        setCallStatus('connected');
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(room, 'offer', offer, user.username);
    } catch (err) {
      console.error(err);
      alert('Microphone access denied or unavailable.');
      setShowCall(false);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    setShowCall(false);
    setCallStatus('calling');
    sendSignal(room, 'end_call', {}, user.username);
  };

  const handleAction = (action) => {
    if (action === 'end') navigate('/');
    if (action === 'circle') {
      alert(`${stranger.username} added to your Circle!`);
      navigate('/');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem', borderBottom: '1px solid var(--border-color)', 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate('/')} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{stranger.username}</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)' }}>{stranger.vibe}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Phone size={20} style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={startCall} />
          <div style={{ 
            fontSize: '0.9rem', fontWeight: 'bold', 
            color: timeLeft < 60 ? 'var(--secondary)' : 'var(--text-main)',
            backgroundColor: 'var(--surface-light)', padding: '0.3rem 0.6rem', borderRadius: '8px'
          }}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="fade-in">
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <span style={{ backgroundColor: 'var(--surface-light)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            You matched with {stranger.username}. Say hi!
          </span>
        </div>
        {messages.map(msg => (
          <div key={msg.id} style={{ 
            display: 'flex', flexDirection: 'column', 
            alignItems: msg.isMe ? 'flex-end' : 'flex-start',
            marginBottom: '1rem', animation: 'slideUp 0.2s ease-out'
          }}>
            <div style={{
              backgroundColor: msg.isMe ? 'var(--primary)' : 'var(--surface-light)',
              color: 'white', padding: '0.75rem 1rem', borderRadius: '16px',
              borderBottomRightRadius: msg.isMe ? '4px' : '16px',
              borderBottomLeftRadius: !msg.isMe ? '4px' : '16px',
              maxWidth: '80%', wordBreak: 'break-word'
            }}>
              {msg.text}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{msg.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-dark)' }}>
        <button onClick={() => handleAction('circle')} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.8rem' }}>
          <UserPlus size={16} /> Add to Circle
        </button>
        <button onClick={() => handleAction('end')} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.8rem', borderColor: 'var(--secondary)' }}>
          <X size={16} color="var(--secondary)" /> End Chat
        </button>
        <button onClick={() => alert('User Reported!')} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}>
          <AlertTriangle size={16} /> Report
        </button>
        <button onClick={() => {alert('User Blocked!'); navigate('/');}} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.8rem', borderColor: '#7f1d1d', color: '#7f1d1d' }}>
          <ShieldX size={16} /> Block
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} style={{ 
        padding: '1rem', borderTop: '1px solid var(--border-color)', 
        backgroundColor: 'var(--surface-dark)', display: 'flex', gap: '0.5rem' 
      }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Send a message..." 
          value={inputBox}
          onChange={(e) => setInputBox(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={20} />
        </button>
      </form>

      {/* Voice Call Overlay */}
      {showCall && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(9, 9, 11, 0.95)', zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }} className="fade-in">
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', animation: 'pulse 1.5s infinite' }}>
            <PhoneCall size={48} color="var(--primary)" />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>{stranger.username}</h2>
          <p className="text-muted" style={{ marginBottom: '3rem' }}>{callStatus === 'calling' ? 'Calling / Waiting...' : 'Connected'}</p>
          
          <div style={{ display: 'flex', gap: '2rem' }}>
            <button onClick={endCall} style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ef4444', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><PhoneOff size={28} /></button>
          </div>
        </div>
      )}
      <audio id="remoteAudio" autoPlay style={{ display: 'none' }}></audio>
    </div>
  );
};

export default RandomChat;
