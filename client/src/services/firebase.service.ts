// firebase.service.ts

import { getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, signInWithPopup } from 'firebase/auth';

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
}

// firebase authentication
const firebaseAuth = getAuth(app);

// google auth provider 
const firebaseGoogleAuthProvider = new GoogleAuthProvider();
firebaseGoogleAuthProvider.setCustomParameters({ prompt: "select_account" });

// Uncomment and use as needed
// setPersistence(firebaseAuth, browserLocalPersistence)
//   .then(() => {
//     console.log('Session persistence set successfully');
//   })
//   .catch((error) => {
//     console.error('Error setting persistence:', error);
//   });

export {
  firebaseAuth,
  firebaseGoogleAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
};
