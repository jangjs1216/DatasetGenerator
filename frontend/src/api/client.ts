import axios from 'axios';
import { useSessionStore } from '../store/session';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = useSessionStore.getState().token;
  const projectId = useSessionStore.getState().activeProjectId;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (projectId) {
    config.headers['X-Project-Id'] = projectId;
  }
  return config;
});
