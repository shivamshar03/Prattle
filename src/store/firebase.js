import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDkrzzc4r1mxr-BPold9yMdbAWHPJ9M1mg",
  authDomain: "prattle-chat-web.firebaseapp.com",
  databaseURL: "https://prattle-chat-web-default-rtdb.firebaseio.com",
  projectId: "prattle-chat-web",
  storageBucket: "prattle-chat-web.firebasestorage.app",
  messagingSenderId: "1051060264943",
  appId: "1:1051060264943:web:680199d60f0267d999e01a"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
