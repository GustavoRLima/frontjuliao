/**
 * Configurações da API
 * 
 * Configure aqui a URL base da sua API
 */

// URL base da API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://sistema.cbjji.com'

// Endpoints da API
export const API_ENDPOINTS = {
  // Registro
  registerAthlete: `${API_BASE_URL}/api/register-competidor`,
  registerTeam: `${API_BASE_URL}/api/register-equipe`,
  
  // Autenticação
  loginCompetidor: `${API_BASE_URL}/api/competidor/login`,
  loginEquipe: `${API_BASE_URL}/api/equipe/login`,
  logoutCompetidor: `${API_BASE_URL}/api/competidor/logout`,
  logoutEquipe: `${API_BASE_URL}/api/equipe/logout`,
  
  // Outros
  getEquipes: `${API_BASE_URL}/api/get-equipes`,
  // Adicione outros endpoints aqui conforme necessário
}

