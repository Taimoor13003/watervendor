// authService.ts
import { GoogleAuthProvider, firebaseAuth, signInWithPopup } from './firebase.service'

class AuthService {
  async signInWithGoogle(): Promise<any | null> {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(firebaseAuth, provider)

      // The signed-in user info.
      const user = result.user;
      const idToken = await user.getIdToken();

      const userData = { id: user.uid, role: "admin", fullName: user.displayName, username: user.displayName, email: user.email }

      return { userData, idToken }
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }


  // isAuthStateChanged() {
  //    return onAuthStateChanged
  // }
  
  // async verifyAuthToken(): Promise<any | null> {

  //   const currentUser = firebaseAuth.currentUser;
  //   console.log(currentUser, "currentUser")


  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       // User is signed in, see docs for a list of available properties
  //       // https://firebase.google.com/docs/reference/js/auth.user
  //       const uid = user.uid;
  //       // ...
  //     } else {
  //       // User is signed out
  //       // ...
  //     }
  //   });




  // }

  // async signOut(): Promise<void> {
  //   try {
  //     await firebase.auth().signOut()
  //   } catch (error) {
  //     console.error('Error signing out:', error)
  //     throw error
  //   }
  // }
}

const authService = new AuthService()
export default authService
