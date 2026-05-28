import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  withCredentials: true, // Importante para las cookies HttpOnly del Gateway
  headers: {
    'Content-Type': 'application/json',
  },
});
