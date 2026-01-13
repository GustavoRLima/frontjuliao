<script setup lang="ts">
import { useRouter } from 'vue-router'
import CompetitionList from '@/components/CompetitionList.vue'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()

/**
 * Navegar para página de inscrição
 */
const handleInscricao = (id: number) => {
  // Verificar se está autenticado
  if (!authStore.isAuthenticated) {
    Swal.fire({
      icon: 'warning',
      title: 'Autenticação Necessária',
      text: 'Você precisa estar logado para se inscrever em uma competição.',
      confirmButtonText: 'Ir para Login',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push({ name: 'login' })
      }
    })
    return
  }

  // Redirecionar para página de inscrição
  router.push({ name: 'competition-inscription', params: { id } })
}

/**
 * Navegar para página de visualização
 */
const handleView = (id: number) => {
  router.push({ name: 'competition-detail', params: { id } })
}
</script>

<template>
  <div class="container-fluid py-4">
    <CompetitionList 
      @edit="handleInscricao"
      @view="handleView"
    />
  </div>
</template>

<style scoped>
.container-fluid {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>

