import axios from 'axios'
import { API_BASE_URL } from './api'

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor de requisição para adicionar o token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de resposta para tratar erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Se o token expirou ou é inválido (401), limpar dados e redirecionar para login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_type')
      localStorage.removeItem('user_type')
      localStorage.removeItem('user_data')
      
      // Redirecionar para login se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

