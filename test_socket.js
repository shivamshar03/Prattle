import { io } from 'socket.io-client';
const s1 = io('http://localhost:3001');
const s2 = io('http://localhost:3001');

s2.on('connect', () => {
  console.log('s2 connected');
  s2.emit('join_channel', '1');
});

s1.on('connect', () => {
  console.log('s1 connected');
  s1.emit('join_channel', '1');
  setTimeout(() => {
    console.log('s1 emitting message');
    s1.emit('send_channel_msg', { channelId: '1', message: 'Hello from s1', user: { username: 'test1' }});
  }, 500);
});

s2.on('receive_channel_msg', (msg) => {
  console.log('s2 Received:', msg);
  process.exit(0);
});

setTimeout(() => {
  console.error('Timeout! Chatting is indeed broken on backend!');
  process.exit(1);
}, 3000);
