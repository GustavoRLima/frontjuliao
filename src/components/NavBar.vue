<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import UserDropdown from '@/components/UserDropdown.vue'

const { locale, t } = useI18n()
const authStore = useAuthStore()

const languages = [
  { code: 'pt-BR', name: 'Português', flagCode: 'br' },
  { code: 'en-US', name: 'English', flagCode: 'us' },
  { code: 'es-ES', name: 'Español', flagCode: 'es' },
  { code: 'de-DE', name: 'Deutsch', flagCode: 'de' },
  { code: 'fr-FR', name: 'Français', flagCode: 'fr' },
  { code: 'it-IT', name: 'Italiano', flagCode: 'it' },
  { code: 'zh-CN', name: '中文', flagCode: 'cn' },
  { code: 'ar-SA', name: 'العربية', flagCode: 'sa' }
]

const changeLanguage = (langCode: string) => {
  locale.value = langCode
  console.log('Idioma alterado para:', langCode)
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow">
    <div class="container-fluid px-4">
      <!-- Logo -->
      <a class="navbar-brand d-flex align-items-center" href="#">
        <img src="/img/logo.png" alt="Logo" height="40" class="d-inline-block align-top me-2">
        <span class="brand-text"></span>
      </a>

      <!-- Botão Toggle para Mobile -->
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarContent"
        aria-controls="navbarContent" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <!-- Menus -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" active-class="active" exact to="/">{{ t('nav.home') }}</router-link>
          </li>
          
          <!-- Login Link - Só mostra se não estiver autenticado -->
          <li class="nav-item" v-if="!authStore.isAuthenticated">
            <router-link class="nav-link" active-class="active" to="/login">{{ t('nav.login') }}</router-link>
          </li>
          
          <li class="nav-item">
            <a class="nav-link" href="#campeonatos">{{ t('nav.championships') }}</a>
          </li>
          
          <li class="nav-item">
            <a class="nav-link" href="#ranking">{{ t('nav.ranking') }}</a>
          </li>
        </ul>

        <!-- User Dropdown e Seletor de Idiomas -->
        <div class="d-flex align-items-center gap-3">
          <!-- User Dropdown -->
          <UserDropdown v-if="authStore.isAuthenticated" />
          
          <!-- Seletor de Idiomas com Bandeiras -->
          <div class="d-flex align-items-center language-selector">
            <button 
              v-for="lang in languages" 
              :key="lang.code"
              @click="changeLanguage(lang.code)"
              :class="['btn btn-link language-flag', { active: locale === lang.code }]"
              :title="lang.name"
            >
              <span :class="`fi fi-${lang.flagCode}`"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <div class="navbar-spacer"></div>
</template>

<style scoped>
.navbar {
  z-index: 1000;
  background-color: #000 !important;
  padding: 0.75rem 0;
}

.brand-text {
  font-weight: 700;
  font-size: 1.25rem;
  color: #fff;
  letter-spacing: 0.5px;
}

.navbar-spacer {
  height: 70px;
}

.language-selector {
  gap: 5px;
}

.language-flag {
  padding: 5px 8px;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: transparent;
}

.language-flag:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.language-flag.active {
  border-color: #28a745;
  background-color: rgba(40, 167, 69, 0.2);
}

.language-flag .fi {
  font-size: 1.5rem;
  display: inline-block;
  border-radius: 3px;
}

.navbar-brand img {
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
}

.nav-link {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem !important;
}

.nav-link:hover {
  color: #28a745 !important;
  transform: translateY(-1px);
}

.nav-link.active {
  color: #28a745 !important;
}

.dropdown-menu-dark {
  background-color: #1a1a1a;
}

.dropdown-item {
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(40, 167, 69, 0.2);
  color: #28a745;
}

@media (max-width: 991px) {
  .language-selector {
    margin-top: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .navbar-brand {
    font-size: 1rem;
  }
  
  .brand-text {
    font-size: 1rem;
  }
}
</style>
