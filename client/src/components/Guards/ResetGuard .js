import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import LoadingScreen from 'src/components/LoadingScreen'
import { useParams, Route } from 'react-router-dom'
import Axios from 'src/utils/realAxios'
import useAuth from 'src/hooks/useAuth';
const GuestGuard = ({ children }) => {
  const [validate, setValidate] = useState()
  const param = useParams()
  const { logout } = useAuth();
  const [message , setMessage ] = useState({valid:false})

  useEffect(() => {
    if(!param) return setValidate('invalid') 
    let api
    if(param.resetId) api = `${process.env.REACT_APP_BACKEND_API}/auth/checkReset.php?params=${param.resetId}`
    if(param.userId) api = `${process.env.REACT_APP_BACKEND_API}/auth/checkVerifyEmail.php?params=${param.userId}`
    Axios.get(api).then((res) => {
      // console.log(res.data)
    setMessage(res.data)
    setValidate(true)
    }).catch((err) => 
    {
      console.log(err)
    setValidate('invalid')
    })
    localStorage.removeItem('accessToken')
    logout()
  }, []);


  if (!validate) {
    return <LoadingScreen bgColor={'#efefef'} />
  }
  if (validate === 'invalid') {
    return <Redirect to="/app" />;
  }

  return (
    <>
      {React.Children.map(children, child =>
        React.cloneElement(child.props.children, message ))}
    </>
  );
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;
