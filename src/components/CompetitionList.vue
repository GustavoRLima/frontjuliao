<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { competicaoService } from '@/services/api.service'
import Swal from 'sweetalert2'
import { API_BASE_URL } from '@/config/api'

const { t } = useI18n()

interface Competicao {
  id: number
  descricao: string
  data_competicao: string
  local: string
  imagem?: string
  [key: string]: any
}

interface PaginationLinks {
  url: string | null
  label: string
  active: boolean
}

interface PaginationData {
  current_page: number
  data: Competicao[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  links: PaginationLinks[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}

const competicoes = ref<Competicao[]>([])
const pagination = ref<PaginationData | null>(null)
const currentPage = ref(1)
const loading = ref(false)

const emit = defineEmits<{
  edit: [id: number]
  view: [id: number]
}>()


/**
 * Buscar competições
 */
const fetchCompeticoes = async (page: number = 1) => {
  loading.value = true
  try {
    const response = await competicaoService.getCompeticoes(page)
    
    // Acessar dados conforme estrutura: $dados['data']['competicoes']
    if (response.data && response.data.competicoes) {
      const paginationData = response.data.competicoes
      competicoes.value = paginationData.data || []
      pagination.value = paginationData
      currentPage.value = paginationData.current_page
    } else {
      competicoes.value = []
      pagination.value = null
    }
  } catch (error: any) {
    console.error('Erro ao buscar competições:', error)
    Swal.fire({
      icon: 'error',
      title: t('competition.errorTitle'),
      text: error.response?.data?.message || t('competition.errorMessage'),
      confirmButtonText: t('common.ok')
    })
  } finally {
    loading.value = false
  }
}

/**
 * Navegar para uma página específica
 */
const goToPage = (page: number) => {
  if (page < 1 || (pagination.value && page > pagination.value.last_page)) {
    return
  }
  fetchCompeticoes(page)
}

/**
 * Formatar data para exibição
 */
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return dateString
  }
}

/**
 * Obter URL completa da imagem
 */
const getImageUrl = (imagePath?: string) => {
    console.log(imagePath)
  if (!imagePath) {
    return '/img/default-competition.svg'
  }
  
  // Se já é uma URL completa, retorna como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Caso contrário, concatena com a URL base
  return `${API_BASE_URL}/${imagePath.replace(/^\//, '')}`
}

/**
 * Lidar com erro de carregamento de imagem
 */
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/img/default-competition.svg'
}

/**
 * Emitir evento de edição
 */
const handleInscricao = (id: number) => {
  emit('edit', id)
}

/**
 * Emitir evento de visualização
 */
const handleView = (id: number) => {
  emit('view', id)
}

onMounted(() => {
  fetchCompeticoes()
})
</script>

<template>
  <div class="competition-list">
    <!-- Cabeçalho -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">{{ t('competition.title') }}</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">{{ t('common.loading') }}</span>
      </div>
      <p class="mt-3">{{ t('common.loading') }}...</p>
    </div>

    <!-- Tabela de Competições -->
    <div v-else-if="competicoes.length > 0" class="table-responsive">
      <table class="table table-hover table-striped align-middle">
        <thead class="table-dark">
          <tr>
            <th style="width: 100px">{{ t('competition.image') }}</th>
            <th>{{ t('competition.description') }}</th>
            <th style="width: 150px">{{ t('competition.date') }}</th>
            <th>{{ t('competition.location') }}</th>
            <th style="width: 120px" class="text-center">{{ t('competition.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="competicao in competicoes" :key="competicao.id">
            <!-- Miniatura da Imagem -->
            <td>
              <img 
                :src="getImageUrl(competicao.imagem_url)" 
                :alt="competicao.descricao"
                class="img-thumbnail competition-thumbnail"
                @error="handleImageError"
              >
            </td>
            
            <!-- Descrição -->
            <td>
              <strong>{{ competicao.descricao }}</strong>
            </td>
            
            <!-- Data -->
            <td>
              {{ formatDate(competicao.data_evento) }}
            </td>
            
            <!-- Local -->
            <td>
              {{ competicao.rua }}, {{ competicao.numero }}, {{ competicao.bairro }} - {{ competicao.cidade }}, {{ competicao.estado }}/{{ competicao.pais }}
            </td>
            
            <!-- Ações -->
            <td class="text-center">
              <div class="btn-group" role="group">                
                <!-- Botão Visualizar -->
                <button
                  type="button"
                  class="btn btn-sm btn-primary tooltip-btn"
                  :data-tooltip="t('competition.view')"
                  @click="handleView(competicao.id)"
                >
                  <font-awesome-icon :icon="['fas', 'eye']" />
                </button>

                <!-- Botão Inscrever -->
                <button
                  type="button"
                  class="btn btn-sm btn-success tooltip-btn"
                  :data-tooltip="t('competition.inscricao')"
                  @click="handleInscricao(competicao.id)"
                >
                  <font-awesome-icon :icon="['fas', 'user-plus']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
      <nav v-if="pagination && pagination.last_page > 1" aria-label="Navegação de páginas">
        <ul class="pagination justify-content-center">
          <!-- Botão Anterior -->
          <li class="page-item" :class="{ disabled: !pagination.prev_page_url }">
            <button 
              class="page-link" 
              @click="goToPage(currentPage - 1)"
              :disabled="!pagination.prev_page_url"
            >
              <i class="fas fa-chevron-left"></i>
              {{ t('common.previous') }}
            </button>
          </li>

          <!-- Números das Páginas -->
          <li 
            v-for="page in pagination.last_page" 
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <button 
              class="page-link" 
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </li>

          <!-- Botão Próximo -->
          <li class="page-item" :class="{ disabled: !pagination.next_page_url }">
            <button 
              class="page-link" 
              @click="goToPage(currentPage + 1)"
              :disabled="!pagination.next_page_url"
            >
              {{ t('common.next') }}
              <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
        
        <!-- Informações de Paginação -->
        <div class="text-center text-muted mt-2">
          {{ t('competition.showing') }} 
          {{ pagination.from }} {{ t('competition.to') }} {{ pagination.to }} 
          {{ t('competition.of') }} {{ pagination.total }} 
          {{ t('competition.results') }}
        </div>
      </nav>
    </div>

    <!-- Mensagem quando não há competições -->
    <div v-else class="text-center py-5">
      <i class="fas fa-trophy fa-4x text-muted mb-3"></i>
      <p class="text-muted">{{ t('competition.noCompetitions') }}</p>
    </div>
  </div>
</template>

<style scoped>
.competition-list {
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.competition-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
}

.table tbody tr {
  transition: all 0.3s ease;
}

.table tbody tr:hover {
  background-color: #f1f3f5;
  transform: translateX(5px);
}

.btn-group .btn {
  margin: 0 2px;
  transition: all 0.3s ease;
}

.btn-group .btn:hover {
  transform: scale(1.1);
}

/* Tooltips customizados CSS */
.tooltip-btn {
  position: relative;
}

.tooltip-btn::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 0%;
  transform: translateX(-50%);
  background-color: #2c3e50;
  color: #ffffff;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 99999;
}

.tooltip-btn::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 0%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #2c3e50;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 99999;
}

.tooltip-btn:hover::before,
.tooltip-btn:hover::after {
  opacity: 1;
  visibility: visible;
}

.tooltip-btn:hover::before {
  bottom: 135%;
}

.tooltip-btn:hover::after {
  bottom: 110%;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.btn-warning:hover {
  background-color: #ffca2c;
  border-color: #ffc720;
  color: #000;
}

.btn-info {
  background-color: #0dcaf0;
  border-color: #0dcaf0;
  color: #000;
}

.btn-info:hover {
  background-color: #31d2f2;
  border-color: #25cff2;
  color: #000;
}

.pagination {
  margin-top: 2rem;
}

.page-link {
  color: #006517;
  border-color: #dee2e6;
  transition: all 0.3s ease;
}

.page-link:hover {
  color: #fff;
  background-color: #006517;
  border-color: #006517;
}

.page-item.active .page-link {
  background-color: #006517;
  border-color: #006517;
  color: #fff;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}


/* Responsivo */
@media (max-width: 768px) {
  .competition-list {
    padding: 1rem;
  }

  .competition-thumbnail {
    width: 60px;
    height: 60px;
  }

  .table {
    font-size: 0.875rem;
  }

  .btn-group .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  .tooltip-btn::before {
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
  }
}
</style>

