const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let waitingUser = null;
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('client_ready', (user) => {
    if (user && user.id) {
      onlineUsers.set(socket.id, user);
      io.emit('online_users_update', Array.from(onlineUsers.entries()).map(([id, u]) => ({ socketId: id, ...u })));
    }
  });

  // --- GROUP CHATS ---
  socket.on('join_channel', (channelId) => {
    socket.join(`channel_${channelId}`);
    console.log(`Socket ${socket.id} joined channel ${channelId}`);
  });

  socket.on('leave_channel', (channelId) => {
    socket.leave(`channel_${channelId}`);
  });

  socket.on('send_channel_msg', ({ channelId, message, user }) => {
    const msg = {
      id: Date.now(),
      user: user.username,
      text: message,
      isSystem: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    // Emit to everyone in room EXCEPT sender
    socket.to(`channel_${channelId}`).emit('receive_channel_msg', msg);
  });

  // --- 1:1 MATCHMAKING ---
  socket.on('find_match', (user) => {
    if (waitingUser && waitingUser.socketId !== socket.id) {
      const room = `room_${Date.now()}`;
      socket.join(room);
      const matchedSocket = io.sockets.sockets.get(waitingUser.socketId);
      if (matchedSocket) {
        matchedSocket.join(room);
        
        io.to(room).emit('match_found', { room, partner: waitingUser.user, user });
        waitingUser = null;
      } else {
        waitingUser = { socketId: socket.id, user };
      }
    } else {
      waitingUser = { socketId: socket.id, user };
    }
  });

  socket.on('direct_match', ({ targetSocketId, user }) => {
    const room = `room_direct_${Date.now()}`;
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.join(room);
      socket.join(room);
      
      const partnerUser = onlineUsers.get(targetSocketId) || { username: 'Unknown' };
      io.to(room).emit('match_found', { room, partner: partnerUser, user });
      
      if (waitingUser && (waitingUser.socketId === socket.id || waitingUser.socketId === targetSocketId)) {
        waitingUser = null;
      }
    }
  });

  socket.on('leave_match_queue', () => {
    if (waitingUser && waitingUser.socketId === socket.id) waitingUser = null;
  });

  socket.on('send_direct_msg', ({ room, message, user }) => {
    const msg = {
      id: Date.now(),
      user: user.username,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.to(room).emit('receive_direct_msg', msg);
  });

  // --- WEBRTC SIGNALING ---
  socket.on('webrtc_offer', ({ room, offer }) => {
    socket.to(room).emit('webrtc_offer', offer);
  });
  
  socket.on('webrtc_answer', ({ room, answer }) => {
    socket.to(room).emit('webrtc_answer', answer);
  });
  
  socket.on('webrtc_ice', ({ room, candidate }) => {
    socket.to(room).emit('webrtc_ice', candidate);
  });

  socket.on('end_call', ({ room }) => {
    socket.to(room).emit('call_ended');
  });

  socket.on('disconnect', () => {
    if (waitingUser && waitingUser.socketId === socket.id) {
      waitingUser = null;
    }
    if (onlineUsers.has(socket.id)) {
      onlineUsers.delete(socket.id);
      io.emit('online_users_update', Array.from(onlineUsers.entries()).map(([id, u]) => ({ socketId: id, ...u })));
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
