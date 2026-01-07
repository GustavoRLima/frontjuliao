import api from '@/config/axios'

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  competidor?: {
    id: number
    nome: string
    email: string
    login: string
    faixa: string
  }
  equipe?: {
    id: number
    descricao: string
    email: string
    login: string
  }
}

interface LoginCredentials {
  login: string
  senha: string
}

export const authService = {
  /**
   * Login de competidor
   */
  async loginCompetidor(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/api/competidor/login', credentials)
    return response.data.data
  },

  /**
   * Login de equipe
   */
  async loginEquipe(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/api/equipe/login', credentials)
    return response.data.data
  },

  /**
   * Logout de competidor
   */
  async logoutCompetidor(): Promise<void> {
    await api.post('/api/competidor/logout')
  },

  /**
   * Logout de equipe
   */
  async logoutEquipe(): Promise<void> {
    await api.post('/api/equipe/logout')
  },

  /**
   * Verifica se o token ainda é válido
   */
  async validateToken(): Promise<boolean> {
    try {
      await api.get('/api/me')
      return true
    } catch (error) {
      return false
    }
  }
}

