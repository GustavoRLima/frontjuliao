import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Competidor {
  id: number
  nome: string
  email: string
  login: string
  faixa: string
}

interface Equipe {
  id: number
  descricao: string
  email: string
  login: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(localStorage.getItem('access_token'))
  const tokenType = ref<string | null>(localStorage.getItem('token_type'))
  const userType = ref<'competidor' | 'equipe' | null>(
    localStorage.getItem('user_type') as 'competidor' | 'equipe' | null
  )
  const userData = ref<Competidor | Equipe | null>(
    localStorage.getItem('user_data') 
      ? JSON.parse(localStorage.getItem('user_data')!) 
      : null
  )

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value)
  
  const userName = computed(() => {
    if (!userData.value) return ''
    if (userType.value === 'competidor') {
      return (userData.value as Competidor).nome
    } else {
      return (userData.value as Equipe).descricao
    }
  })

  const userEmail = computed(() => {
    return userData.value?.email || ''
  })

  const isCompetidor = computed(() => userType.value === 'competidor')
  const isEquipe = computed(() => userType.value === 'equipe')

  // Actions
  function setAuthData(
    token: string,
    type: string,
    user: Competidor | Equipe,
    userTypeParam: 'competidor' | 'equipe'
  ) {
    accessToken.value = token
    tokenType.value = type
    userType.value = userTypeParam
    userData.value = user

    // Salvar no localStorage
    localStorage.setItem('access_token', token)
    localStorage.setItem('token_type', type)
    localStorage.setItem('user_type', userTypeParam)
    localStorage.setItem('user_data', JSON.stringify(user))
  }

  function clearAuthData() {
    accessToken.value = null
    tokenType.value = null
    userType.value = null
    userData.value = null

    // Limpar localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('user_type')
    localStorage.removeItem('user_data')
  }

  function updateUserData(user: Competidor | Equipe) {
    userData.value = user
    localStorage.setItem('user_data', JSON.stringify(user))
  }

  return {
    // State
    accessToken,
    tokenType,
    userType,
    userData,
    // Getters
    isAuthenticated,
    userName,
    userEmail,
    isCompetidor,
    isEquipe,
    // Actions
    setAuthData,
    clearAuthData,
    updateUserData
  }
})

