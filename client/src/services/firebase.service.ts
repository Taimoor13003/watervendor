import { getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth, setPersistence, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCF7k6j7LbGbAZMLGBXR7Vk-MF5aPkt2Lg",
  authDomain: "water-vendor-ce707.firebaseapp.com",
  projectId: "water-vendor-ce707",
  storageBucket: "water-vendor-ce707.appspot.com",
  messagingSenderId: "282841612728",
  appId: "1:282841612728:web:ce15a5341c218459140f4d",
  measurementId: "G-F0985EKPXX"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]; // Reuse the initialized app if already initialized
}

// Firebase authentication
const firebaseAuth = getAuth(app);

// Google auth provider
const firebaseGoogleAuthProvider = new GoogleAuthProvider();
firebaseGoogleAuthProvider.setCustomParameters({ prompt: "select_account" });

export {
  firebaseAuth,
  firebaseGoogleAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
};
