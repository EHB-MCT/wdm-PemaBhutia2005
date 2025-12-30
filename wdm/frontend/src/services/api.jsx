import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Clothing items API calls
export const clothingAPI = {
  getAll: async () => {
    const response = await api.get('/clothing-items');
    return response.data;
  },

  create: async (formData) => {
    const response = await api.post('/clothing-items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clothing-items/${id}`);
    return response.data;
  },
};

// Outfits API calls
export const outfitAPI = {
  getAll: async () => {
    const response = await api.get('/outfits');
    return response.data;
  },

  create: async (outfitData) => {
    const response = await api.post('/outfits', outfitData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/outfits/${id}`);
    return response.data;
  },
};

// Admin API calls
export const adminAPI = {
  register: async (name, email, password, adminKey) => {
    const response = await api.post('/auth/admin/register', { name, email, password, adminKey });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/admin/login', { email, password });
    return response.data;
  },

  getUsersWithItems: async () => {
    const response = await api.get('/clothing-items/admin/users-with-items');
    return response.data;
  },

  getHistogramData: async () => {
    const response = await api.get('/clothing-items/admin/histogram-data');
    return response.data;
  },
};

export default api;