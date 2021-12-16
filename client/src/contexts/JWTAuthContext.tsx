import React, {
  createContext,
  useEffect,
  useReducer
} from 'react';
import jwtDecode from 'jwt-decode';
import SplashScreen from 'src/components/SplashScreen/SplashScreen';
import Axios from 'src/utils/realAxios'

const initialAuthState = {
  isAuthenticated: false,
  isInitialised: false,
  user: null
};

interface decodedType {
  exp: number;
}

const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }
  const decoded : decodedType = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    // axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    Axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    // delete axios.defaults.headers.common.Authorization;
    delete Axios.defaults.headers.common.Authorization;
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIALISE': {
      const { isAuthenticated, user } = action.payload;

      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user
      };
    }
    case 'LOGIN': {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user
      };
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
        user: null
      };
    }
    case 'REGISTER': {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user
      };
    }
    default: {
      return { ...state };
    }
  }
};


const AuthContext = createContext({
  ...initialAuthState,
  method: 'JWT',
  login: () => Promise.resolve(),
  logout: () => { },
  register: () => Promise.resolve()
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  const login = async (email, password) => {
    const response = await Axios.post(`${process.env.REACT_APP_BACKEND_API}/auth/login.php`, { email, password });
    // const response = await axios.post('/api/account/login', { email, password });
    const { accessToken, user } = response.data;
    setSession(accessToken);
    
    dispatch({
      type: 'LOGIN',
      payload: {
        user
      }
    });
  };

  const forgot = async (email) => {
    const response = await Axios.get(`${process.env.REACT_APP_BACKEND_API}/auth/forgot.php?email=${email} `)
    console.log(response.data)
    return response
  }
  const reset = async ({ password, params }) => {
    const response = await Axios.post(`${process.env.REACT_APP_BACKEND_API}/auth/resetPassword.php`, { password, params })
    return response
  }
  const logout = () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (email, name, password) => {

    const response = await Axios.post(`${process.env.REACT_APP_BACKEND_API}/auth/register.php`, { name, email, password })
    
    return response

  };

  useEffect(() => {

    const initialise = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);


          const response = await Axios.get(`${process.env.REACT_APP_BACKEND_API}/auth/verifyMe.php`)
          // return
          // const response = await axios.get('/api/account/me');
          let { user } = response.data;
          if (!user?.avatar) user.avatar = ''

          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: true,
              user
            }
          });

        } else {
          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: false,
              user: null
            }
          });

        }


      } catch (err) {
        dispatch({
          type: 'INITIALISE',
          payload: {
            isAuthenticated: false,
            user: null
          }
        });

      }
    };

    initialise();
  }, []);

  if (!state.isInitialised) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'JWT',
        login,
        forgot,
        logout,
        reset,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;