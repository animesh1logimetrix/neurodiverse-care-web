import axios from 'axios';

// Create a configured instance of axios
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api', // Change this to your real base URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: attach auth tokens here
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: global error handling
axiosClient.interceptors.response.use(
  (response) => {
    // You can unwrap the response data here if you prefer
    return response;
  },
  (error) => {
    // Global handling for 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('Session expired. Redirecting to login...');
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
