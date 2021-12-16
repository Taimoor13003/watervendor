import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { user } = useAuth()


  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  if (user && user?.role == null && isAuthenticated) {
    return <Redirect to="/choose-role" />;
  }

  return (
    <>
      {children}
    </>
  );

};

AuthGuard.propTypes = {
  children: PropTypes.node
};

export default AuthGuard;
