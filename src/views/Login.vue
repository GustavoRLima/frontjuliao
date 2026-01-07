<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

// Tipo de login: 'athlete' ou 'team'
const loginType = ref<'athlete' | 'team'>('athlete')

// Dados do formulário
const loginData = ref({
  username: '',
  password: ''
})

// Estado de loading
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  
  // Validação básica
  if (!loginData.value.username || !loginData.value.password) {
    errorMessage.value = t('login.fillAllFields')
    return
  }
  
  isLoading.value = true
  
  try {
    // Aqui você vai adicionar a lógica de autenticação
    console.log('Tipo de login:', loginType.value)
    console.log('Dados:', loginData.value)
    
    // Simulação de requisição (remover depois)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Após login bem-sucedido, redirecionar
    // router.push('/')
    
  } catch (error) {
    errorMessage.value = t('login.errorMessage')
  } finally {
    isLoading.value = false
  }
}

const toggleLoginType = (type: 'athlete' | 'team') => {
  loginType.value = type
  errorMessage.value = ''
  loginData.value = {
    username: '',
    password: ''
  }
}
</script>

<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-12 col-md-8 col-lg-5">
          <div class="login-card shadow-lg">
            <!-- Logo -->
            <div class="text-center mb-4">
              <img src="/img/logo.png" alt="Logo" class="login-logo mb-3">
              <h2 class="login-title">{{ t('login.title') }}</h2>
            </div>
            
            <!-- Toggle de Tipo de Login -->
            <div class="login-type-toggle mb-4">
              <button
                type="button"
                :class="['toggle-btn', { active: loginType === 'athlete' }]"
                @click="toggleLoginType('athlete')"
              >
                <i class="bi bi-person-circle me-2"></i>
                {{ t('login.athleteLogin') }}
              </button>
              <button
                type="button"
                :class="['toggle-btn', { active: loginType === 'team' }]"
                @click="toggleLoginType('team')"
              >
                <i class="bi bi-people-fill me-2"></i>
                {{ t('login.teamLogin') }}
              </button>
            </div>
            
            <!-- Formulário de Login -->
            <form @submit.prevent="handleLogin">
              <!-- Tipo de Login Selecionado -->
              <div class="selected-type mb-3">
                <p class="text-center mb-0">
                  <small class="text-muted">{{ t('login.loggingAs') }}</small>
                  <span class="badge ms-2" :class="loginType === 'athlete' ? 'bg-primary' : 'bg-success'">
                    {{ loginType === 'athlete' ? t('login.athlete') : t('login.team') }}
                  </span>
                </p>
              </div>
              
              <!-- Campo de Login/Usuário -->
              <div class="mb-3">
                <label for="username" class="form-label">
                  <i class="bi bi-person me-1"></i>
                  {{ t('login.username') }}
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="loginData.username"
                  :placeholder="t('login.usernamePlaceholder')"
                  required
                >
              </div>
              
              <!-- Campo de Senha -->
              <div class="mb-3">
                <label for="password" class="form-label">
                  <i class="bi bi-lock me-1"></i>
                  {{ t('login.password') }}
                </label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="loginData.password"
                  :placeholder="t('login.passwordPlaceholder')"
                  required
                >
              </div>
              
              <!-- Mensagem de Erro -->
              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ errorMessage }}
              </div>
              
              <!-- Links Auxiliares -->
              <div class="d-flex justify-content-between mb-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="rememberMe">
                  <label class="form-check-label" for="rememberMe">
                    {{ t('login.rememberMe') }}
                  </label>
                </div>
                <a href="#" class="forgot-password">{{ t('login.forgotPassword') }}</a>
              </div>
              
              <!-- Botão de Login -->
              <button 
                type="submit" 
                class="btn btn-login w-100 mb-3"
                :disabled="isLoading"
              >
                <span v-if="isLoading">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {{ t('login.loading') }}
                </span>
                <span v-else>
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  {{ t('login.loginButton') }}
                </span>
              </button>
              
              <!-- Link para Cadastro -->
              <div class="text-center">
                <p class="mb-0">
                  {{ t('login.noAccount') }}
                  <router-link :to="loginType === 'athlete' ? '/atleta' : '/equipe'" class="register-link">
                    {{ t('login.registerHere') }}
                  </router-link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #006517 0%, #127330 100%);
  min-height: 100vh;
  padding: 20px 0;
}

.login-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-logo {
  max-width: 120px;
  height: auto;
}

.login-title {
  color: #333;
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 0;
}

.login-type-toggle {
  display: flex;
  gap: 10px;
  background: #f8f9fa;
  padding: 5px;
  border-radius: 50px;
}

.toggle-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 50px;
  background: transparent;
  color: #6c757d;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.toggle-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.toggle-btn.active {
  background: linear-gradient(135deg, #006517 0%, #127330 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 101, 23, 0.4);
}

.selected-type {
  text-align: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 10px;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #006517;
  box-shadow: 0 0 0 0.2rem rgba(0, 101, 23, 0.15);
}

.forgot-password {
  color: #006517;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password:hover {
  color: #127330;
  text-decoration: underline;
}

.btn-login {
  padding: 14px;
  background: linear-gradient(135deg, #006517 0%, #127330 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 101, 23, 0.4);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-link {
  color: #006517;
  font-weight: 600;
  text-decoration: none;
}

.register-link:hover {
  color: #127330;
  text-decoration: underline;
}

.alert {
  border-radius: 10px;
  border: none;
}

@media (max-width: 768px) {
  .login-card {
    padding: 1.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
  
  .toggle-btn {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
}
</style>

