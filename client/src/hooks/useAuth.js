import { useContext } from 'react';
import AuthContext from 'src/contexts/JWTAuthContext.tsx';

const useAuth = () => useContext(AuthContext);

export default useAuth;
