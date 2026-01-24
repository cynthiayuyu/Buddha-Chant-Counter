import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD8vubeXg1j8XrkaHp9yjqdsdVxqOOOXjQ",
  authDomain: "buddha-chant-counter.firebaseapp.com",
  projectId: "buddha-chant-counter",
  storageBucket: "buddha-chant-counter.firebasestorage.app",
  messagingSenderId: "295517826410",
  appId: "1:295517826410:web:63e1a361d16d4af0b44913"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
