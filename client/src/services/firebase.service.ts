// firebase.js
import firebase, {getApps, initializeApp} from 'firebase/app'
import 'firebase/auth'
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

let app
if (!getApps.length) {
  app = initializeApp(firebaseConfig)
}

// firebase authentication
const firebaseAuth = getAuth(app);

// google auth provider 

const firebaseGoogleAuthProvider = new GoogleAuthProvider();
firebaseGoogleAuthProvider.setCustomParameters({ prompt: "select_account" });



// setPersistence(firebaseAuth, browserLocalPersistence)
//   .then(() => {
//     console.log('Session persistence set successfully');
//     // You can initialize other Firebase services or perform additional actions here
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
}
export default firebase
