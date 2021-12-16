import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';

const FreshGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const {user} = useAuth()


  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  if (user?.role == null  && isAuthenticated ) {
    return (
        <>
          {children}
        </>
      );
    }
    
      return <Redirect to="/app" />;
  
};

FreshGuard.propTypes = {
  children: PropTypes.node
};

export default FreshGuard;
