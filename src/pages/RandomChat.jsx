import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, UserPlus, X, Phone, PhoneOff, PhoneCall, AlertTriangle, ShieldX, Video, Mic, MicOff, VideoOff, Camera, CameraOff } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useRealtime } from '../store/RealtimeContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

const RandomChat = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const { sendMessage, subscribeMessages, sendSignal, subscribeSignaling, clearSignaling } = useRealtime();
  const [messages, setMessages] = useState([]);
  const [inputBox, setInputBox] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const room = state?.room || 'test_room';
  const strangerInit = state?.stranger || { username: 'CosmicOwl404', vibe: 'Chill' };
  const [stranger] = useState(strangerInit);
  const messagesEndRef = useRef(null);

  // Call state
  const [showCall, setShowCall] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | connecting | connected
  const [callType, setCallType] = useState('voice'); // voice | video
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // WebRTC refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const remoteDescriptionSetRef = useRef(false);
  const isCallActiveRef = useRef(false);

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
      if (msg.user !== user.username) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => unsub();
  }, [room, user.username, subscribeMessages]);

  // Cleanup WebRTC on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []);

  const cleanupCall = useCallback(() => {
    isCallActiveRef.current = false;
    remoteDescriptionSetRef.current = false;
    pendingCandidatesRef.current = [];

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }, []);

  const flushPendingCandidates = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !remoteDescriptionSetRef.current) return;

    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Failed to add buffered ICE candidate:', e);
      }
    }
  }, []);

  const createPeerConnection = useCallback((type) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;
    remoteDescriptionSetRef.current = false;
    pendingCandidatesRef.current = [];

    pc.onicecandidate = (event) => {
      if (event.candidate && isCallActiveRef.current) {
        sendSignal(room, 'ice', event.candidate, user.username);
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;

      if (type === 'video') {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      }
      // Always set audio (video streams contain audio tracks too)
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log('[WebRTC] ICE connection state:', state);
      if (state === 'connected' || state === 'completed') {
        setCallStatus('connected');
      } else if (state === 'failed') {
        console.error('[WebRTC] ICE connection failed');
        setCallStatus('connecting');
      } else if (state === 'disconnected' || state === 'closed') {
        if (isCallActiveRef.current) {
          setCallStatus('connecting');
        }
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      }
    };

    return pc;
  }, [room, user.username, sendSignal]);

  // Subscribe to WebRTC signaling
  useEffect(() => {
    const unsub = subscribeSignaling(room, user.username, async (signal) => {
      try {
        if (signal.type === 'offer') {
          // Incoming call — auto-accept
          const incomingCallType = signal.callType || 'voice';
          setCallType(incomingCallType);
          setShowCall(true);
          setCallStatus('connecting');
          isCallActiveRef.current = true;

          const mediaConstraints = {
            audio: true,
            video: incomingCallType === 'video',
          };

          const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          localStreamRef.current = stream;

          if (incomingCallType === 'video' && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          const pc = createPeerConnection(incomingCallType);
          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          remoteDescriptionSetRef.current = true;
          await flushPendingCandidates();

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(room, 'answer', answer, user.username);

        } else if (signal.type === 'answer') {
          const pc = peerConnectionRef.current;
          if (pc && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
            remoteDescriptionSetRef.current = true;
            await flushPendingCandidates();
          }

        } else if (signal.type === 'ice') {
          if (signal.data) {
            if (remoteDescriptionSetRef.current && peerConnectionRef.current) {
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.data));
              } catch (e) {
                console.warn('Failed to add ICE candidate, buffering:', e);
                pendingCandidatesRef.current.push(signal.data);
              }
            } else {
              // Buffer it — remote description not set yet
              pendingCandidatesRef.current.push(signal.data);
            }
          }

        } else if (signal.type === 'end_call') {
          setShowCall(false);
          setCallStatus('idle');
          cleanupCall();
        }
      } catch (e) {
        console.error('[WebRTC] Signaling error:', e);
      }
    });
    return () => unsub();
  }, [room, user.username, stranger.username, sendSignal, subscribeSignaling, createPeerConnection, cleanupCall, flushPendingCandidates]);

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

  const startCall = async (type = 'voice') => {
    setCallType(type);
    setShowCall(true);
    setCallStatus('calling');
    isCallActiveRef.current = true;

    try {
      // Clear stale signals before starting
      await clearSignaling(room);

      const mediaConstraints = {
        audio: true,
        video: type === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      localStreamRef.current = stream;

      if (type === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = createPeerConnection(type);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(room, 'offer', offer, user.username, { callType: type });
    } catch (err) {
      console.error('[WebRTC] startCall error:', err);
      alert(type === 'video'
        ? 'Camera/Microphone access denied or unavailable.'
        : 'Microphone access denied or unavailable.');
      setShowCall(false);
      setCallStatus('idle');
      isCallActiveRef.current = false;
    }
  };

  const endCall = () => {
    cleanupCall();
    setShowCall(false);
    setCallStatus('idle');
    sendSignal(room, 'end_call', {}, user.username);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  const handleAction = (action) => {
    if (action === 'end') navigate('/');
    if (action === 'circle') {
      alert(`${stranger.username} added to your Circle!`);
      navigate('/');
    }
  };

  const renderCallOverlay = () => {
    if (!showCall) return null;

    if (callType === 'video') {
      return (
        <div className="call-overlay fade-in" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: '#09090b', zIndex: 100,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Remote video (full screen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              position: 'absolute', top: 0, left: 0,
              backgroundColor: '#18181b',
            }}
          />

          {/* Top bar with name and status */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '1.5rem', zIndex: 10,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{stranger.username}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                {callStatus === 'connected' ? '🟢 Video Call Connected' : callStatus === 'calling' ? 'Calling...' : 'Connecting...'}
              </p>
            </div>
          </div>

          {/* Local video (PiP) */}
          <div style={{
            position: 'absolute', top: '5rem', right: '1rem', zIndex: 10,
            width: '120px', height: '160px', borderRadius: '12px',
            overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: 'scaleX(-1)',
                backgroundColor: '#27272a',
              }}
            />
            {isCameraOff && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: '#27272a', display: 'flex', alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CameraOff size={24} color="var(--text-muted)" />
              </div>
            )}
          </div>

          {/* Call controls */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '2rem', zIndex: 10,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            display: 'flex', justifyContent: 'center', gap: '1.5rem',
          }}>
            {/* Toggle Mic */}
            <button onClick={toggleMute} style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255,255,255,0.2)',
              border: 'none', color: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              backdropFilter: 'blur(10px)', transition: 'all 0.2s',
            }}>
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Toggle Camera */}
            <button onClick={toggleCamera} style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: isCameraOff ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255,255,255,0.2)',
              border: 'none', color: 'white', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              backdropFilter: 'blur(10px)', transition: 'all 0.2s',
            }}>
              {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
            </button>

            {/* End Call */}
            <button onClick={endCall} style={{
              width: '56px', height: '56px', borderRadius: '50%',
              backgroundColor: '#ef4444', border: 'none', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <PhoneOff size={24} />
            </button>
          </div>

          {/* Connecting state overlay */}
          {callStatus !== 'connected' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(9,9,11,0.85)', zIndex: 5,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                backgroundColor: 'var(--surface-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2rem', animation: 'pulse 1.5s infinite',
                boxShadow: '0 0 30px rgba(139,92,246,0.3)',
              }}>
                <Video size={48} color="var(--primary)" />
              </div>
              <h2 style={{ marginBottom: '0.5rem', color: 'white' }}>{stranger.username}</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                {callStatus === 'calling' ? 'Calling...' : 'Connecting...'}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Voice call overlay
    return (
      <div className="call-overlay fade-in" style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(9, 9, 11, 0.95)', zIndex: 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
          background: callStatus === 'connected'
            ? 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)'
            : 'radial-gradient(circle, rgba(236,72,153,0.1), transparent 70%)',
          animation: 'pulse 3s infinite',
        }} />

        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          background: callStatus === 'connected'
            ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))'
            : 'var(--surface-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '2rem',
          animation: callStatus !== 'connected' ? 'pulse 1.5s infinite' : 'none',
          boxShadow: callStatus === 'connected' ? '0 0 40px rgba(139,92,246,0.3)' : 'none',
          transition: 'all 0.5s ease',
        }}>
          <PhoneCall size={48} color={callStatus === 'connected' ? '#a78bfa' : 'var(--primary)'} />
        </div>

        <h2 style={{ marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>{stranger.username}</h2>
        <p style={{
          color: 'var(--text-muted)', marginBottom: '3rem',
          position: 'relative', zIndex: 1,
        }}>
          {callStatus === 'connected' ? '🟢 Voice Call Connected' : callStatus === 'calling' ? 'Calling / Waiting...' : 'Connecting...'}
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          {/* Mute toggle */}
          <button onClick={toggleMute} style={{
            width: '56px', height: '56px', borderRadius: '50%',
            backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.8)' : 'var(--surface-light)',
            border: 'none', color: 'white', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* End Call */}
          <button onClick={endCall} style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#ef4444', border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <PhoneOff size={28} />
          </button>
        </div>
      </div>
    );
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Phone size={20} style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => startCall('voice')} title="Voice Call" />
          <Video size={20} style={{ cursor: 'pointer', color: 'var(--secondary)' }} onClick={() => startCall('video')} title="Video Call" />
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

      {/* Call Overlay */}
      {renderCallOverlay()}

      {/* Hidden audio element for voice calls */}
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
    </div>
  );
};

export default RandomChat;
