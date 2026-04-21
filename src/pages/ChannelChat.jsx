import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useSocket } from '../store/SocketContext';

const defaultChannels = {
  '1': { name: 'Weekend Chill' },
  '2': { name: 'Cafe Hopping' },
  '3': { name: 'Startup & Tech' },
  '4': { name: 'Gym Buddies' },
  '5': { name: 'Late Night Talks' },
};

const ChannelChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputBox, setInputBox] = useState('');
  const messagesEndRef = useRef(null);

  const channel = defaultChannels[id];

  useEffect(() => {
    if (!socket || !channel) return;
    
    // Reset and mock system message
    setMessages([{ id: Date.now(), user: 'System', text: `Welcome to ${channel?.name}! Messages are live.`, isSystem: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    
    socket.emit('join_channel', id);

    socket.on('receive_channel_msg', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.emit('leave_channel', id);
      socket.off('receive_channel_msg');
    };
  }, [socket, id, channel?.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!channel) return <div className="p-4">Channel not found</div>;

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputBox.trim()) return;

    setMessages(prev => [...prev, {
      id: Date.now(),
      user: user.username,
      text: inputBox,
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    
    socket.emit('send_channel_msg', { channelId: id, message: inputBox, user });
    setInputBox('');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '1rem', borderBottom: '1px solid var(--border-color)', 
        display: 'flex', alignItems: 'center', gap: '1rem',
        backgroundColor: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10
      }}>
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>#{channel.name}</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tap here for info</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="fade-in">
        {messages.map(msg => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                <span style={{ backgroundColor: 'var(--surface-light)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} style={{ 
              display: 'flex', flexDirection: 'column', 
              alignItems: msg.isMe ? 'flex-end' : 'flex-start',
              marginBottom: '1rem',
              animation: 'slideUp 0.2s ease-out'
            }}>
              {!msg.isMe && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.2rem', marginLeft: '0.5rem' }}>{msg.user}</span>}
              <div style={{
                backgroundColor: msg.isMe ? 'var(--primary)' : 'var(--surface-light)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                borderBottomRightRadius: msg.isMe ? '4px' : '16px',
                borderBottomLeftRadius: !msg.isMe ? '4px' : '16px',
                maxWidth: '80%',
                wordBreak: 'break-word'
              }}>
                {msg.text}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{msg.time}</span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{ 
        padding: '1rem', borderTop: '1px solid var(--border-color)', 
        backgroundColor: 'var(--surface-dark)', display: 'flex', gap: '0.5rem' 
      }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Message the channel..." 
          value={inputBox}
          onChange={(e) => setInputBox(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChannelChat;
