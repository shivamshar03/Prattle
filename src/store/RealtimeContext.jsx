import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { db } from './firebase';
import { ref, set, push, remove, onValue, onChildAdded, onChildRemoved, onDisconnect, serverTimestamp, get } from 'firebase/database';
import { useAuth } from './AuthContext';

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const presenceRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Register this user as online
    const userPresenceRef = ref(db, `online_users/${user.id}`);
    presenceRef.current = userPresenceRef;

    set(userPresenceRef, {
      id: user.id,
      username: user.username,
      interests: user.interests || [],
      joinedAt: user.joinedAt,
      lastSeen: Date.now()
    });

    // Auto-remove when disconnected
    onDisconnect(userPresenceRef).remove();

    return () => {
      remove(userPresenceRef);
    };
  }, [user]);

  // --- Online Users ---
  const subscribeOnlineUsers = useCallback((callback) => {
    const usersRef = ref(db, 'online_users');
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const users = data ? Object.values(data) : [];
      callback(users);
    });
    return unsub;
  }, []);

  // --- Matchmaking ---
  const findMatch = useCallback(async (currentUser) => {
    const queueRef = ref(db, 'matchmaking_queue');
    const snapshot = await get(queueRef);
    const queue = snapshot.val();

    if (queue) {
      // Find someone else in the queue
      const entries = Object.entries(queue);
      const match = entries.find(([key, val]) => val.id !== currentUser.id);

      if (match) {
        const [matchKey, matchUser] = match;
        const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        // Remove matched user from queue
        await remove(ref(db, `matchmaking_queue/${matchKey}`));

        // Notify BOTH users by writing to direct_requests
        await set(ref(db, `direct_requests/${matchUser.id}/${roomId}`), {
          room: roomId,
          fromUser: currentUser,
          timestamp: Date.now()
        });

        // Return the match info to the caller (initiator)
        return { room: roomId, stranger: matchUser };
      }
    }

    // No match found, add self to queue
    await set(ref(db, `matchmaking_queue/${currentUser.id}`), {
      id: currentUser.id,
      username: currentUser.username,
      interests: currentUser.interests || [],
      timestamp: Date.now()
    });

    return null; // Will be matched when someone else joins
  }, []);

  const leaveMatchQueue = useCallback(async (userId) => {
    await remove(ref(db, `matchmaking_queue/${userId}`));
  }, []);

  const subscribeToMatchRequests = useCallback((userId, callback) => {
    const requestsRef = ref(db, `direct_requests/${userId}`);
    const unsub = onChildAdded(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
        // Clean up after reading
        remove(snapshot.ref);
      }
    });
    return unsub;
  }, []);

  // Watch the queue for when someone matches with us
  const subscribeToQueueMatch = useCallback((userId, callback) => {
    const myQueueRef = ref(db, `matchmaking_queue/${userId}`);
    const unsub = onChildRemoved(ref(db, 'matchmaking_queue'), (snapshot) => {
      // Our entry was removed = we got matched, so check direct_requests
    });
    return unsub;
  }, []);

  // --- Direct Match (click on user) ---
  const directMatch = useCallback(async (targetUser, currentUser) => {
    const roomId = `room_direct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Notify the target user
    await set(ref(db, `direct_requests/${targetUser.id}/${roomId}`), {
      room: roomId,
      fromUser: currentUser,
      timestamp: Date.now()
    });

    return { room: roomId, stranger: targetUser };
  }, []);

  // --- Chat Messages ---
  const sendMessage = useCallback(async (roomId, message, username) => {
    const msgRef = push(ref(db, `rooms/${roomId}/messages`));
    await set(msgRef, {
      id: Date.now(),
      user: username,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });
  }, []);

  const subscribeMessages = useCallback((roomId, callback) => {
    const msgsRef = ref(db, `rooms/${roomId}/messages`);
    const unsub = onChildAdded(msgsRef, (snapshot) => {
      callback(snapshot.val());
    });
    return unsub;
  }, []);

  // --- Channel Messages ---
  const sendChannelMessage = useCallback(async (channelId, message, username) => {
    const msgRef = push(ref(db, `channels/${channelId}/messages`));
    await set(msgRef, {
      id: Date.now(),
      user: username,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });
  }, []);

  const subscribeChannelMessages = useCallback((channelId, callback) => {
    const msgsRef = ref(db, `channels/${channelId}/messages`);
    const unsub = onChildAdded(msgsRef, (snapshot) => {
      callback(snapshot.val());
    });
    return unsub;
  }, []);

  // --- WebRTC Signaling ---
  const sendSignal = useCallback(async (roomId, type, data, from) => {
    const sigRef = push(ref(db, `rooms/${roomId}/signaling`));
    await set(sigRef, { type, data, from, timestamp: Date.now() });
  }, []);

  const subscribeSignaling = useCallback((roomId, myUsername, callback) => {
    const sigRef = ref(db, `rooms/${roomId}/signaling`);
    const unsub = onChildAdded(sigRef, (snapshot) => {
      const signal = snapshot.val();
      // Only process signals from the OTHER user
      if (signal && signal.from !== myUsername) {
        callback(signal);
      }
    });
    return unsub;
  }, []);

  const value = {
    subscribeOnlineUsers,
    findMatch,
    leaveMatchQueue,
    subscribeToMatchRequests,
    directMatch,
    sendMessage,
    subscribeMessages,
    sendChannelMessage,
    subscribeChannelMessages,
    sendSignal,
    subscribeSignaling,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
