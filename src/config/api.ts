/**
 * Configurações da API
 * 
 * Configure aqui a URL base da sua API
 */

// URL base da API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://sistema.cbjji.com'

// Endpoints da API
export const API_ENDPOINTS = {
  registerAthlete: `${API_BASE_URL}/api/register-competidor`,
  getEquipes: `${API_BASE_URL}/api/get-equipes`,
  // Adicione outros endpoints aqui conforme necessário
}

