import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor (optional, kept for general usage)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration/401s
api.interceptors.response.use(
  (response) => response.data, // Simplify response data
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if auth fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Normalize error object structure
    const customError = new Error(error.response?.data?.message || error.message || 'An error occurred');
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;
    return Promise.reject(customError);
  }
);

export default api;
