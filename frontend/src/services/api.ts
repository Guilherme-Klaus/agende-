import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Verifica se a requisição que falhou é alguma das rotas de login
    const isLoginRoute = err.config?.url?.includes('login');

    // Só desloga e recarrega a página se o 401 acontecer fora das rotas de login
    // (ex: token expirou enquanto o usuário usava o painel)
    if (err.response?.status === 401 && !isLoginRoute) {
      localStorage.clear();
      window.location.href = '/';
    }
    
    // Repassa o erro de volta para quem chamou (App.tsx)
    return Promise.reject(err);
  }
);