import axios from 'axios';

const axiosInstance = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
});

axiosInstance.interceptors.response.use(
  response => response,
  error =>
    Promise.reject(
      (error.response && error.response.data) || 'Something went wrong'
    )
);

export default axiosInstance;
