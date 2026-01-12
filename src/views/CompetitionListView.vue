<script setup lang="ts">
import { useRouter } from 'vue-router'
import CompetitionList from '@/components/CompetitionList.vue'
import { onMounted } from 'vue'

const router = useRouter()

/**
 * Navegar para página de edição
 */
const handleEdit = (id: number) => {
  console.log('Editar competição:', id)
  // TODO: Implementar navegação para página de edição
  // router.push({ name: 'competition-edit', params: { id } })
}

/**
 * Navegar para página de visualização
 */
const handleView = (id: number) => {
  console.log('Visualizar competição:', id)
  // TODO: Implementar navegação para página de visualização
  // router.push({ name: 'competition-view', params: { id } })
}
</script>

<template>
  <div class="container-fluid py-4">
    <CompetitionList 
      @edit="handleEdit"
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

