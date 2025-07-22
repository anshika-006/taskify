import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCZTRrIJikeawtqd8F-S1-ZB_JbpKaEAJ4",
  authDomain: "taskify-app-ba757.firebaseapp.com",
  projectId: "taskify-app-ba757",
  storageBucket: "taskify-app-ba757.firebasestorage.app",
  messagingSenderId: "1051093533607",
  appId: "1:1051093533607:web:e7be3ab0769840a6112c82",
  measurementId: "G-ZWQB88YFLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;