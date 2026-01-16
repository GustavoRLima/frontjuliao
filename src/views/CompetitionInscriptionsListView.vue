<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { competicaoService } from '@/services/api.service'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

interface Inscrito {
  atleta: string
  equipe: string
  sexo: string
  categoria: string
  peso: string
  faixa: string
  [key: string]: any
}

interface PaginationData {
  current_page: number
  data: Inscrito[]
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

const competicaoId = ref<number>(0)
const competicaoNome = ref<string>('')
const inscritos = ref<Inscrito[]>([])
const pagination = ref<PaginationData | null>(null)
const currentPage = ref(1)
const loading = ref(false)
const searchTerm = ref('')
const searchTimeout = ref<number | null>(null)

/**
 * Buscar inscritos
 */
const fetchInscritos = async (page: number = 1, search?: string) => {
  loading.value = true
  try {
    const response = await competicaoService.getTodosInscritos(
      competicaoId.value, 
      page, 
      search
    )
    
    if (response.data) {
        
        if (response.data.inscricoes) {
            const paginationData = response.data.inscricoes
            inscritos.value = paginationData.data || []
            pagination.value = paginationData
            currentPage.value = paginationData.current_page
        }
      
      if (response.data.competicao_nome) {
        competicaoNome.value = response.data.competicao_nome
      }
    } else {
      inscritos.value = []
      pagination.value = null
    }
  } catch (error: any) {
    console.error('Erro ao buscar inscritos:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.response?.data?.message || 'Erro ao buscar inscritos.',
      confirmButtonText: 'OK'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Ir para página específica
 */
const goToPage = (page: number) => {
  if (page < 1 || (pagination.value && page > pagination.value.last_page)) {
    return
  }
  fetchInscritos(page, searchTerm.value || undefined)
}

/**
 * Buscar com debounce
 */
const handleSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    currentPage.value = 1
    fetchInscritos(1, searchTerm.value || undefined)
  }, 500)
}

/**
 * Limpar busca
 */
const clearSearch = () => {
  searchTerm.value = ''
  currentPage.value = 1
  fetchInscritos(1)
}

/**
 * Voltar para detalhes da competição
 */
const goBack = () => {
  router.push({ name: 'competition-detail', params: { id: competicaoId.value } })
}

onMounted(() => {
  competicaoId.value = parseInt(route.params.id as string)
  fetchInscritos()
})
</script>

<template>
  <div class="inscriptions-list-container">
    <div class="inscriptions-content">
      <!-- Header -->
      <div class="list-header">
        <button class="btn btn-secondary mb-3" @click="goBack">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          Voltar
        </button>
        
        <h2>
          <font-awesome-icon :icon="['fas', 'list']" />
          Inscritos na Competição
        </h2>
        <h4 class="text-muted">{{ competicaoNome }}</h4>
      </div>

      <!-- Filtro de Busca -->
      <div class="search-box">
        <div class="input-group">
          <span class="input-group-text">
            <font-awesome-icon :icon="['fas', 'search']" />
          </span>
          <input
            v-model="searchTerm"
            type="text"
            class="form-control"
            placeholder="Buscar por nome do atleta..."
            @input="handleSearch"
          >
          <button 
            v-if="searchTerm" 
            class="btn btn-outline-secondary"
            @click="clearSearch"
          >
            <font-awesome-icon :icon="['fas', 'times']" />
            Limpar
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        <p class="mt-3">Carregando inscritos...</p>
      </div>

      <!-- Tabela de Inscritos -->
      <div v-else-if="inscritos.length > 0" class="table-responsive">
        <table class="table table-hover table-striped align-middle">
          <thead class="table-dark">
            <tr>
              <th>Atleta</th>
              <th>Equipe</th>
              <th>Sexo</th>
              <th>Categoria</th>
              <th>Peso</th>
              <th>Faixa</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(inscrito, index) in inscritos" :key="index">
              <td><strong>{{ inscrito.atleta }}</strong></td>
              <td>{{ inscrito.equipe || '-' }}</td>
              <td>{{ inscrito.sexo }}</td>
              <td>{{ inscrito.categoria }}</td>
              <td>{{ inscrito.peso }}</td>
              <td>
                <span class="badge faixa-badge" :class="`faixa-${inscrito.faixa.toLowerCase()}`">
                  {{ inscrito.faixa }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginação -->
        <nav v-if="pagination && pagination.last_page > 1" aria-label="Navegação de páginas">
          <ul class="pagination justify-content-center">
            <!-- Botão Anterior -->
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button 
                class="page-link" 
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" />
                Anterior
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
            <li class="page-item" :class="{ disabled: currentPage === pagination.last_page }">
              <button 
                class="page-link" 
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === pagination.last_page"
              >
                Próximo
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </button>
            </li>
          </ul>
          
          <!-- Informações de Paginação -->
          <div class="text-center text-muted mt-2">
            Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }} inscritos
          </div>
        </nav>
      </div>

      <!-- Sem Resultados -->
      <div v-else class="text-center py-5">
        <font-awesome-icon :icon="['fas', 'info-circle']" class="fa-4x text-muted mb-3" />
        <p class="text-muted">
          {{ searchTerm ? 'Nenhum inscrito encontrado com esse nome.' : 'Nenhum inscrito nesta competição.' }}
        </p>
        <button v-if="searchTerm" class="btn btn-primary" @click="clearSearch">
          <font-awesome-icon :icon="['fas', 'times']" />
          Limpar Filtro
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inscriptions-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.inscriptions-content {
  max-width: 1400px;
  margin: 0 auto;
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.list-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #006517;
}

.list-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.list-header h4 {
  font-weight: 500;
  margin-bottom: 0;
}

.search-box {
  margin-bottom: 2rem;
}

.search-box .input-group {
  max-width: 600px;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.search-box .form-control {
  border-left: none;
  border-right: none;
  padding: 0.75rem 1rem;
}

.search-box .form-control:focus {
  border-color: #006517;
  box-shadow: 0 0 0 0.2rem rgba(0, 101, 23, 0.25);
}

.search-box .btn-outline-secondary {
  border-left: none;
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
  padding: 1rem;
}

.table tbody tr {
  transition: all 0.3s ease;
}

.table tbody tr:hover {
  background-color: #f1f3f5;
  transform: translateX(3px);
}

.table tbody td {
  padding: 1rem;
}

.faixa-badge {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.faixa-branca {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #dee2e6;
}

.faixa-cinza {
  background-color: #6c757d;
  color: white;
}

.faixa-amarela {
  background-color: #ffc107;
  color: #000;
}

.faixa-laranja {
  background-color: #fd7e14;
  color: white;
}

.faixa-verde {
  background-color: #28a745;
  color: white;
}

.faixa-azul {
  background-color: #007bff;
  color: white;
}

.faixa-roxa {
  background-color: #6f42c1;
  color: white;
}

.faixa-marrom {
  background-color: #795548;
  color: white;
}

.faixa-preta {
  background-color: #000000;
  color: white;
}

.pagination {
  margin-top: 2rem;
}

.page-link {
  color: #006517;
  border-color: #dee2e6;
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
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
  .inscriptions-list-container {
    padding: 1rem;
  }

  .inscriptions-content {
    padding: 1rem;
  }

  .search-box .input-group {
    max-width: 100%;
  }

  .table {
    font-size: 0.875rem;
  }

  .table thead th,
  .table tbody td {
    padding: 0.75rem 0.5rem;
  }

  .list-header h2 {
    font-size: 1.5rem;
  }

  .list-header h4 {
    font-size: 1.1rem;
  }
}
</style>

