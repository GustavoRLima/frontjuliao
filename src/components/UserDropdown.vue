<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth.service'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isDropdownOpen = ref(false)
const isLoggingOut = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// Abreviar nome para apenas primeiro nome e sobrenome
const abbreviatedName = computed(() => {
  const fullName = authStore.userName
  if (!fullName) return ''
  
  const names = fullName.trim().split(' ').filter(n => n.length > 0)
  
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  
  // Retorna primeiro nome + sobrenome (último nome)
  return `${names[0]} ${names[names.length - 1]}`
})

const toggleDropdown = (event: Event) => {
  event.stopPropagation()
  isDropdownOpen.value = !isDropdownOpen.value
  console.log('Dropdown toggled:', isDropdownOpen.value)
}

// Fechar dropdown ao clicar fora
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

const handleEditProfile = () => {
  isDropdownOpen.value = false
  // Redirecionar para página de edição de perfil
  if (authStore.isCompetidor) {
    router.push('/atleta/editar')
  } else {
    router.push('/equipe/editar')
  }
}

const handleLogout = async () => {
  isDropdownOpen.value = false
  isLoggingOut.value = true
  
  try {
    // Chamar API de logout
    if (authStore.isCompetidor) {
      await authService.logoutCompetidor()
    } else {
      await authService.logoutEquipe()
    }
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  } finally {
    // Limpar dados de autenticação mesmo que a API falhe
    authStore.clearAuthData()
    isLoggingOut.value = false
    router.push('/login')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="user-dropdown" v-if="authStore.isAuthenticated" ref="dropdownRef">
    <button 
      class="user-dropdown-toggle"
      @click="toggleDropdown"
    >
      <div class="user-avatar">
        <font-awesome-icon 
          :icon="['fas', authStore.isCompetidor ? 'circle-user' : 'users']" 
        />
      </div>
      <span class="user-name">{{ abbreviatedName }}</span>
      <font-awesome-icon 
        :icon="['fas', 'chevron-down']" 
        class="dropdown-icon"
        :class="{ 'rotate': isDropdownOpen }"
      />
    </button>

    <div class="dropdown-menu" v-if="isDropdownOpen">
      <div class="dropdown-header">
        <div class="user-info">
          <strong>{{ authStore.userName }}</strong>
          <small>{{ authStore.userEmail }}</small>
          <span class="user-badge" :class="authStore.isCompetidor ? 'badge-competidor' : 'badge-equipe'">
            {{ authStore.isCompetidor ? t('common.athlete') : t('common.team') }}
          </span>
        </div>
      </div>
      
      <div class="dropdown-divider"></div>
      
      <button 
        class="dropdown-item"
        @click="handleEditProfile"
      >
        <font-awesome-icon :icon="['fas', 'pen-to-square']" class="me-2" />
        {{ t('user.editProfile') }}
      </button>
      
      <button 
        class="dropdown-item dropdown-item-danger"
        @click="handleLogout"
        :disabled="isLoggingOut"
      >
        <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="me-2" />
        {{ isLoggingOut ? t('user.loggingOut') : t('user.logout') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-dropdown {
  position: relative;
  display: inline-block;
  /* Garante que o dropdown não seja cortado */
}

/* Container do dropdown deve permitir overflow */
.user-dropdown::v-deep,
.user-dropdown > * {
  overflow: visible !important;
}

.user-dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.user-dropdown-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.user-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotate {
  transform: rotate(180deg);
}

.user-dropdown-toggle:hover .dropdown-icon:not(.rotate) {
  transform: translateY(2px);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 280px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 9999 !important;
  overflow-x: hidden;
  overflow-y: auto;
  display: block;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dropdown-header {
  padding: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-info strong {
  color: #333;
  font-size: 1.1rem;
}

.user-info small {
  color: #6c757d;
  font-size: 0.85rem;
}

.user-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 5px;
  width: fit-content;
}

.badge-competidor {
  background: #e7f1ff;
  color: #0066cc;
}

.badge-equipe {
  background: #d4edda;
  color: #155724;
}

.dropdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item:first-of-type {
  border-radius: 0;
}

.dropdown-item:last-of-type {
  border-radius: 0 0 15px 15px;
}

.dropdown-item-danger {
  color: #dc3545;
}

.dropdown-item-danger:hover {
  background: #fff5f5;
}

.dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
  
  .user-dropdown-toggle {
    padding: 8px 12px;
  }
  
  .dropdown-menu {
    min-width: 260px;
  }
}
</style>

