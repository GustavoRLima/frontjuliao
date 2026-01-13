import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

// Configure o axios com interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_type')
      localStorage.removeItem('user_type')
      localStorage.removeItem('user_data')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Serviços de Competidor
export const competidorService = {
  /**
   * Buscar dados do competidor autenticado
   */
  async getMe() {
    try {
      const response = await api.get('/api/competidor/me')
      // console.log('Dados do competidor:', response.data.data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar competidor:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Editar dados do competidor
   */
  async edit(formData: FormData) {
    try {
      const response = await api.post('/api/competidor/edit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // console.log('Competidor atualizado:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao editar competidor:', error.response?.data || error.message)
      throw error
    }
  }
}

// Serviços de Equipe
export const equipeService = {
  /**
   * Buscar dados da equipe autenticada
   */
  async getMe() {
    try {
      const response = await api.get('/api/equipe/me')
      // console.log('Dados da equipe:', response.data.data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar equipe:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Editar dados da equipe
   */
  async edit(formData: FormData) {
    try {
      const response = await api.post('/api/equipe/edit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // console.log('Equipe atualizada:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao editar equipe:', error.response?.data || error.message)
      throw error
    }
  }
}

// Serviços de Competições
export const competicaoService = {
  /**
   * Buscar competições com paginação
   */
  async getCompeticoes(page: number = 1) {
    try {
      const response = await api.get('/api/get-competicoes', {
        params: { page }
      })
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar competições:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Buscar detalhes de uma competição específica
   */
  async getCompeticaoById(id: number) {
    try {
      const response = await api.get(`/api/get-competicao/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar competição:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Buscar categorias de uma competição
   */
  async getCategorias(competidor: number) {
    try {
      const response = await api.get(`/api/get-competidor-categoria/${competidor}`)
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Buscar atletas de uma equipe (requer autenticação como equipe)
   */
  async getAtletasEquipe() {
    try {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await api.get('/api/equipe/get-competidores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Erro ao buscar atletas da equipe:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Criar inscrição na competição
   */
  async criarInscricao(data: any) {
    try {
      const response = await api.post('/api/inscrever', data)
      return response.data
    } catch (error: any) {
      console.error('Erro ao criar inscrição:', error.response?.data || error.message)
      throw error
    }
  }
}

export default api

