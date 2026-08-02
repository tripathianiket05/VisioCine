import axios from 'axios';

// Use VITE_API_URL from environment, fallback to localhost for local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let accessToken = null;
let currentUser = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;
export const getCurrentUser = () => currentUser;

export const initAuth = async () => {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    // Don't attempt to fetch /me if we know we aren't logged in, avoids 401 console errors
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated: false, user: null } }));
    return null;
  }

  try {
    // If we don't have an access token in memory (e.g., page was refreshed),
    // proactively fetch a new one using the refresh token cookie to avoid an initial 401 on /me.
    if (!accessToken) {
      try {
        const refreshRes = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        if (refreshRes.data.accessToken) {
          setAccessToken(refreshRes.data.accessToken);
        }
      } catch (err) {
        // Silent catch for refresh failure; the subsequent /me request will fail and handle logout
      }
    }

    const res = await apiClient.get('/api/auth/me');
    currentUser = res.data;
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated: true, user: currentUser } }));
    return currentUser;
  } catch (error) {
    currentUser = null;
    localStorage.removeItem('isLoggedIn'); // Clear the flag if session is actually invalid
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated: false, user: null } }));
    return null;
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch (err) {
    console.error('Logout error', err);
  } finally {
    setAccessToken(null);
    currentUser = null;
    localStorage.removeItem('isLoggedIn');
    window.dispatchEvent(new CustomEvent('auth-change', { detail: { isAuthenticated: false, user: null } }));
  }
};

// Watchlist API
export const getWatchlist = async () => {
  const res = await apiClient.get('/api/catalog/watchlist');
  return res.data;
};

export const addToWatchlist = async (movieId) => {
  const res = await apiClient.post('/api/catalog/watchlist', { movieId });
  return res.data;
};

export const removeFromWatchlist = async (movieId) => {
  const res = await apiClient.delete(`/api/catalog/watchlist/${movieId}`);
  return res.data;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add the access token
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for refresh token rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If it's a 401 error and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token using the HttpOnly cookie
        // Using base axios here to avoid interceptor loops if refresh fails
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );
        
        const newAccessToken = refreshResponse.data.accessToken;
        
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed (e.g., 403 Forbidden because cookie expired or is invalid)
        setAccessToken(null);
        // Only redirect to login if they were trying to hit a protected route that wasn't /me
        if (originalRequest.url !== '/api/auth/me') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
