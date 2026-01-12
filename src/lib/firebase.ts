import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBs4yWgx14cl0dt5hr6ihDjDRJXVsEZvJI",
    authDomain: "spacescope-318a0.firebaseapp.com",
    projectId: "spacescope-318a0",
    storageBucket: "spacescope-318a0.firebasestorage.app",
    messagingSenderId: "138759014702",
    appId: "1:138759014702:web:404f27203151650590d2bf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
