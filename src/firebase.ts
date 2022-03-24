import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDcMH_IyP_pOLUSxaHhzEdJir2uePCp7-k',
  authDomain: 'heektime-v3.firebaseapp.com',
  projectId: 'heektime-v3',
  storageBucket: 'heektime-v3.appspot.com',
  messagingSenderId: '240407878341',
  appId: '1:240407878341:web:d54d92a559823d6e67aeac',
  measurementId: 'G-D2WLS22VMF',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (process.env.REACT_APP_AUTH_EMULATOR_URL) {
  connectAuthEmulator(auth, process.env.REACT_APP_AUTH_EMULATOR_URL);
}
if (
  process.env.REACT_APP_FIRESTORE_EMULATOR_HOST &&
  process.env.REACT_APP_FIRESTORE_EMULATOR_PORT
) {
  connectFirestoreEmulator(
    db,
    process.env.REACT_APP_FIRESTORE_EMULATOR_HOST,
    parseInt(process.env.REACT_APP_FIRESTORE_EMULATOR_PORT)
  );
}
if (
  process.env.REACT_APP_STORAGE_EMULATOR_HOST &&
  process.env.REACT_APP_STORAGE_EMULATOR_PORT
) {
  connectStorageEmulator(
    storage,
    process.env.REACT_APP_STORAGE_EMULATOR_HOST,
    parseInt(process.env.REACT_APP_STORAGE_EMULATOR_PORT)
  );
}

export { app, auth, analytics, db, storage };
