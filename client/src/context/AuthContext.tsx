// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'
import authService from 'src/services/auth.service'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { firebaseAuth } from 'src/services/firebase.service'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  loginWithGoogle: () => Promise.resolve(),
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth ,(authUser) => {
      setLoading(true)

      // setLoading(true);
      if (authUser) {
        // User is signed in
        const userData = { 
          id: authUser.uid, 
          role: "admin", 
          fullName: authUser.displayName || "", 
          username: authUser.displayName || "", 
          email: authUser.email || "", 
          password : ""
         }
         setUser({...userData});
         setLoading(false)
         console.log(authUser, "authUser")

        // 
      } else {
        // No user is signed in
        // setUser(null);
        localStorage.removeItem('userData')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('accessToken')
            setUser(null)
            setLoading(false)
            if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
              router.replace('/login')
            }
      }

      // setLoading(false);
    });

    return () => {
      unsubscribe(); // Unsubscribe from the listener when component unmounts
    };
  }, [router]);


  // useEffect(() => {
    
  //   const initAuth = async (): Promise<void> => {
  //     // await authService.verifyAuthToken()
  //     const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)!
  //     if (storedToken) {
  //       setLoading(true)
  //       await axios
  //         .get(authConfig.meEndpoint, {
  //           headers: {
  //             Authorization: storedToken
  //           }
  //         })
  //         .then(async response => {
  //           setLoading(false)
  //           setUser({ ...response.data.userData })
  //         })
  //         .catch(() => {
  //           localStorage.removeItem('userData')
  //           localStorage.removeItem('refreshToken')
  //           localStorage.removeItem('accessToken')
  //           setUser(null)
  //           setLoading(false)
  //           if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
  //             router.replace('/login')
  //           }
  //         })
  //     } else {
  //       setLoading(false)
  //     }
  //   }

  //   initAuth()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {

    axios
      .post(authConfig.loginEndpoint, params)
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
          : null
        const returnUrl = router.query.returnUrl

        setUser({ ...response.data.userData })
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(response.data.userData)) : null

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })

  }

  const handleLoginWithGoogle = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    try {
      authService.signInWithGoogle().then( ({userData , idToken}) => {
        const rememberMe = true
        rememberMe
          ? window.localStorage.setItem(authConfig.storageTokenKeyName, idToken)
          : null
        const returnUrl = router.query.returnUrl

        setUser({ ...userData })
        rememberMe ? window.localStorage.setItem('userData', JSON.stringify(userData)) : null

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL as string)

      })
    } catch (err: any) {
      if (errorCallback) errorCallback(err)
    }

  }

  const handleLogout = () => {
    signOut(firebaseAuth).then(()=>{
      console.log("signout done")
    }).catch((err)=>{
      console.log(err)
    })
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }
console.log(user,
  loading,)
  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    loginWithGoogle: handleLoginWithGoogle
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
