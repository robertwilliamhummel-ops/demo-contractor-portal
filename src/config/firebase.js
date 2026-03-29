import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDliZdpmyMDceJKITBBdNKVamjwNW8Z8Z0",
  authDomain: "techflow-demo-portal.firebaseapp.com",
  projectId: "techflow-demo-portal",
  storageBucket: "techflow-demo-portal.firebasestorage.app",
  messagingSenderId: "36415340966",
  appId: "1:36415340966:web:777eafe5c8b0c3b600cf67"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export default app;