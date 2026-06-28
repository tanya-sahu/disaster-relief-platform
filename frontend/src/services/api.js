import axios from 'axios';

// Agar production me hai toh deployed URL use hoga, nahi toh local proxy/localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || ''; 

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;