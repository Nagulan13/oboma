import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlEFgUg0ba7HHAaf6xC7G0OT8hF-6GUbI",
  authDomain: "oboma-5730f.firebaseapp.com",
  projectId: "oboma-5730f",
  storageBucket: "oboma-5730f.appspot.com",
  messagingSenderId: "971587600243",
  appId: "1:971587600243:web:440d1cf309bf704bf80f06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
