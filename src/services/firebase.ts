import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAlbyyucwEyZoS4926HkPY8IYKgtJgQYbI",
  authDomain: "ct-spark.firebaseapp.com",
  projectId: "ct-spark",
  storageBucket: "ct-spark.firebasestorage.app",
  messagingSenderId: "257137505265",
  appId: "1:257137505265:web:962e34d9bfe60c02cd4a50",
  measurementId: "G-NN9QRFEKWK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 