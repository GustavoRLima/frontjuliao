<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { competicaoService } from '@/services/api.service'
import { API_BASE_URL } from '@/config/api'
import Swal from 'sweetalert2'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface Competition {
  id: number
  descricao: string
  data_evento: string
  imagem_url?: string
  agenda?: string
  endereco_local?: string
  cep?: string
  rua?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
  pais?: string
  quem_pode_competir?: string
  cronograma?: string
  ingressos?: string
  premiacao?: string
  agrupamento?: string
  reembolso?: string
  organizacao_apoio?: string
  regulamento?: string
  tabela_pesos?: string
  mais_informacoes?: string
  resultado_geral_url?: string
  [key: string]: any
}

interface Inscricao {
  id: number
  competidor_id: number
  competidor_nome: string
  categoria_id: number
  categoria_nome: string
  [key: string]: any
}

interface Categoria {
  id: number
  nome: string
  faixa: string
  qtd_competidores: number
  sexo: string
  idade_inicio: number
  idade_fim: number
  peso_categoria: string
  [key: string]: any
}

const competition = ref<Competition | null>(null)
const loading = ref(false)
const activeTab = ref('informacoes_gerais')
const showInscricoesModal = ref(false)
const inscricoes = ref<Inscricao[]>([])
const loadingInscricoes = ref(false)
const categorias = ref<Categoria[]>([])
const loadingCategorias = ref(false)
const searchCategoria = ref('')
const searchCategoriaTimeout = ref<number | null>(null)

const tabs = [
  { id: 'informacoes_gerais', label: 'Informações Gerais', icon: 'info-circle' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar' },
  { id: 'endereco', label: 'Endereço', icon: 'map-marker-alt' },
  { id: 'quem_pode_competir', label: 'Quem Pode Competir', icon: 'users' },
  { id: 'cronograma', label: 'Cronograma', icon: 'clock' },
  { id: 'chaveamento', label: 'Chaveamento', icon: 'key' },
  { id: 'ingressos', label: 'Ingressos', icon: 'ticket-alt' },
  { id: 'premiacao', label: 'Premiação', icon: 'trophy' },
  { id: 'agrupamento', label: 'Agrupamento', icon: 'layer-group' },
  { id: 'reembolso', label: 'Reembolso', icon: 'money-bill-wave' },
  { id: 'organizacao_apoio', label: 'Organização e Apoio', icon: 'hands-helping' },
  { id: 'regulamento', label: 'Regulamento', icon: 'file-contract' },
  { id: 'tabela_pesos', label: 'Tabela de Pesos', icon: 'weight' },
  { id: 'mais_informacoes', label: 'Mais Informações', icon: 'plus-circle' },
  { id: 'resultado_geral', label: 'Resultado geral', icon: 'circle-check' }
]

/**
 * Buscar detalhes da competição
 */
const fetchCompetition = async () => {
  loading.value = true
  try {
    const id = parseInt(route.params.id as string)
    const response = await competicaoService.getCompeticaoById(id)
    
    if (response.data) {
      competition.value = response.data
    }
  } catch (error: any) {
    console.error('Erro ao buscar competição:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.response?.data?.message || 'Erro ao buscar detalhes da competição',
      confirmButtonText: 'OK'
    }).then(() => {
      router.push({ name: 'competitions' })
    })
  } finally {
    loading.value = false
  }
}

/**
 * Obter URL completa da imagem
 */
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) {
    return '/img/default-competition.svg'
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  return `${API_BASE_URL}/${imagePath.replace(/^\//, '')}`
}

/**
 * Formatar data para exibição
 */
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return dateString
  }
}

/**
 * Verificar se é PDF
 */
const isPDF = (filePath?: string) => {
  if (!filePath) return false
  return filePath.toLowerCase().endsWith('.pdf') || filePath.toLowerCase().includes('pdf')
}

/**
 * Obter URL completa do arquivo
 */
const getFileUrl = (filePath?: string) => {
  if (!filePath) return ''
  
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  
  return `${API_BASE_URL}/${filePath.replace(/^\//, '')}`
}

/**
 * Abrir PDF em nova aba
 */
const openPDFInNewTab = (filePath?: string) => {
  if (!filePath) return
  const url = getFileUrl(filePath)
  window.open(url, '_blank')
}

/**
 * Voltar para lista de competições
 */
const goBack = () => {
  router.push({ name: 'competitions' })
}

/**
 * Ir para página de inscrição
 */
const goToInscricao = () => {
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
  router.push({ name: 'competition-inscription', params: { id: competition.value?.id } })
}

/**
 * Lidar com erro de carregamento de imagem
 */
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/img/default-competition.svg'
}

/**
 * Abrir modal de inscrições
 */
const abrirMinhasInscricoes = async () => {
  if (!authStore.isAuthenticated) {
    Swal.fire({
      icon: 'warning',
      title: 'Autenticação Necessária',
      text: 'Você precisa estar logado para ver suas inscrições.',
      confirmButtonText: 'OK'
    })
    return
  }

  showInscricoesModal.value = true
  await buscarInscricoes()
}

/**
 * Buscar inscrições
 */
const buscarInscricoes = async () => {
  if (!competition.value) return

  loadingInscricoes.value = true
  try {
    let response
    if (authStore.isEquipe) {
      response = await competicaoService.getInscricoesEquipe(competition.value.id)
    } else {
      response = await competicaoService.getInscricoesCompetidor(competition.value.id)
    }
    
    if (response.data && response.data.inscricoes) {
      inscricoes.value = response.data.inscricoes
    } else {
      inscricoes.value = []
    }
  } catch (error: any) {
    console.error('Erro ao buscar inscrições:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.response?.data?.message || 'Erro ao buscar inscrições.',
      confirmButtonText: 'OK'
    })
  } finally {
    loadingInscricoes.value = false
  }
}

/**
 * Remover inscrição
 */
const removerInscricao = async (inscricao: Inscricao) => {
  if (!competition.value) return

  const result = await Swal.fire({
    icon: 'warning',
    title: 'Confirmar Remoção',
    html: `Deseja realmente remover a inscrição de <strong>${inscricao.competidor_nome}</strong> na categoria <strong>${inscricao.categoria_nome}</strong>?`,
    showCancelButton: true,
    confirmButtonText: 'Sim, remover',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  })

  if (!result.isConfirmed) return

  try {
    const data = {
      competicao_id: competition.value.id,
      competidor_id: inscricao.competidor_id,
      categoria_id: inscricao.categoria_id
    }

    if (authStore.isEquipe) {
      await competicaoService.removerInscricaoEquipe(data)
    } else {
      await competicaoService.removerInscricaoCompetidor(data)
    }

    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: 'Inscrição removida com sucesso!',
      confirmButtonText: 'OK'
    })

    // Atualizar lista
    await buscarInscricoes()
  } catch (error: any) {
    console.error('Erro ao remover inscrição:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.response?.data?.message || 'Erro ao remover inscrição.',
      confirmButtonText: 'OK'
    })
  }
}

/**
 * Fechar modal
 */
const fecharModal = () => {
  showInscricoesModal.value = false
}

/**
 * Ir para lista de todos os inscritos
 */
const verTodosInscritos = () => {
  router.push({ name: 'competition-inscriptions-list', params: { id: competition.value?.id } })
}

/**
 * Buscar categorias do chaveamento
 */
const buscarCategorias = async (search?: string) => {
  if (!competition.value) return

  loadingCategorias.value = true
  try {
    const response = await competicaoService.getChaveamento(
      competition.value.id,
      search
    )
    
    if (response.data) {
      categorias.value = response.data
    } else {
      categorias.value = []
    }
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.response?.data?.message || 'Erro ao buscar categorias.',
      confirmButtonText: 'OK'
    })
  } finally {
    loadingCategorias.value = false
  }
}

/**
 * Buscar categoria com debounce
 */
const handleSearchCategoria = () => {
  if (searchCategoriaTimeout.value) {
    clearTimeout(searchCategoriaTimeout.value)
  }

  searchCategoriaTimeout.value = window.setTimeout(() => {
    buscarCategorias(searchCategoria.value || undefined)
  }, 500)
}

/**
 * Limpar busca de categoria
 */
const clearSearchCategoria = () => {
  searchCategoria.value = ''
  buscarCategorias()
}

/**
 * Ver chaveamento de uma categoria
 */
const verChaveamento = (categoria: Categoria) => {
  // TODO: Implementar visualização do chaveamento
  console.log('Ver chaveamento da categoria:', categoria)
  Swal.fire({
    icon: 'info',
    title: 'Chaveamento',
    text: `Visualizar chaveamento da categoria: ${categoria.nome}`,
    confirmButtonText: 'OK'
  })
}

/**
 * Dividir faixas por separador '-'
 */
const getFaixas = (faixa: string): string[] => {
  if (!faixa) return []
  return faixa.split('-').map(f => f.trim()).filter(f => f)
}

/**
 * Watch para quando mudar para a aba de chaveamento
 */
watch(activeTab, (newTab) => {
  if (newTab === 'chaveamento' && categorias.value.length === 0 && !loadingCategorias.value) {
    buscarCategorias()
  }
})

onMounted(() => {
  fetchCompetition()
})
</script>

<template>
  <div class="competition-detail-container">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3">Carregando detalhes da competição...</p>
    </div>

    <!-- Conteúdo -->
    <div v-else-if="competition" class="competition-detail">
      <!-- Botão Voltar -->
      <div class="mb-3">
        <button class="btn btn-secondary" @click="goBack">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          Voltar
        </button>
      </div>

      <!-- Imagem Principal -->
      <div class="competition-header">
        <img 
          :src="getImageUrl(competition.imagem_url)" 
          :alt="competition.descricao"
          class="competition-main-image"
          @error="handleImageError"
        >
      </div>

      <!-- Título -->
      <div class="competition-title">
        <h2>{{ competition.descricao }}</h2>
        <p class="text-muted">
          <b>Data do Evento:</b>
          <font-awesome-icon :icon="['fas', 'calendar']" />
          {{ formatDate(competition.data_evento) }}
        </p>
        <div class="inscription-actions">
          <button class="btn btn-success btn-lg" @click="goToInscricao" v-if="new Date(competition.data_evento) > new Date()">
            <font-awesome-icon :icon="['fas', 'user-plus']" />
            Inscrever-se
          </button>
          <button 
            v-if="authStore.isAuthenticated && new Date(competition.data_evento) > new Date()" 
            class="btn btn-primary btn-lg" 
            @click="abrirMinhasInscricoes"
          >
            <font-awesome-icon :icon="['fas', 'list']" />
            {{ authStore.isEquipe ? 'Inscrições da Equipe' : 'Minhas Inscrições' }}
          </button>
          <button 
            class="btn btn-info btn-lg" 
            @click="verTodosInscritos"
          >
            <font-awesome-icon :icon="['fas', 'users']" />
            Inscrições
          </button>
        </div>
      </div>

      <!-- Modal de Inscrições -->
      <div v-if="showInscricoesModal" class="modal-overlay" @click="fecharModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>
              <font-awesome-icon :icon="['fas', 'list']" />
              {{ authStore.isEquipe ? 'Inscrições da Equipe' : 'Minhas Inscrições' }}
            </h3>
            <button class="btn-close" @click="fecharModal">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>

          <div class="modal-body">
            <!-- Loading -->
            <div v-if="loadingInscricoes" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
              </div>
              <p class="mt-2">Carregando inscrições...</p>
            </div>

            <!-- Sem inscrições -->
            <div v-else-if="inscricoes.length === 0" class="text-center py-4">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="fa-3x text-muted mb-3" />
              <p class="text-muted">Nenhuma inscrição encontrada nesta competição.</p>
              <button class="btn btn-success mt-3" @click="goToInscricao">
                <font-awesome-icon :icon="['fas', 'user-plus']" />
                Fazer Inscrição
              </button>
            </div>

            <!-- Lista de inscrições -->
            <div v-else>
              <div class="inscricoes-table">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Atleta</th>
                      <th>Categoria</th>
                      <th class="text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="inscricao in inscricoes" :key="`${inscricao.competidor_id}-${inscricao.categoria_id}`">
                      <td>{{ inscricao.competidor_nome }}</td>
                      <td>{{ inscricao.categoria_nome }}</td>
                      <td class="text-center">
                        <button 
                          class="btn btn-sm btn-danger"
                          @click="removerInscricao(inscricao)"
                        >
                          <font-awesome-icon :icon="['fas', 'trash']" />
                          Remover
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="modal-footer-actions mt-3">
                <button class="btn btn-success" @click="goToInscricao">
                  <font-awesome-icon :icon="['fas', 'user-plus']" />
                  Nova Inscrição
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs e Conteúdo -->
      <div class="competition-content">
        <!-- Tabs - Lateral Esquerda -->
        <div class="tabs-sidebar">
          <div class="nav flex-column nav-pills">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="nav-link"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <font-awesome-icon :icon="['fas', tab.icon]" />
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Conteúdo - Lateral Direita -->
        <div class="tab-content-area">
          <!-- Informações Gerais -->
          <div v-if="activeTab === 'informacoes_gerais'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'info-circle']" />
              Informações Gerais
            </h3>
            <div class="content-box">
                <div v-html="competition.informacoes_gerais || 'Sem informações disponíveis.'"></div>
            </div>
          </div>

          <!-- Agenda -->
          <div v-if="activeTab === 'agenda'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'calendar']" />
              Agenda
            </h3>
            <div class="content-box">
              <div v-html="competition.agenda || 'Nenhuma informação de agenda disponível.'"></div>
            </div>
          </div>

          <!-- Endereço -->
          <div v-if="activeTab === 'endereco'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              Endereço
            </h3>
            <div class="content-box">
              <div class="row">
                <div class="col-md-12">
                  <div class="info-item">
                    <strong>Local:</strong>
                    <p>{{ competition.endereco_local || '-' }}</p>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="info-item">
                    <strong>Endereço:</strong>
                    <p>{{ competition.rua || '-' }}, {{ competition.numero || '-' }} - {{ competition.bairro || '-' }}</p>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12">
                  <div class="info-item">
                    <p>{{ competition.cidade || '-' }} - {{ competition.estado || '-' }}, {{ competition.cep || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quem Pode Competir -->
          <div v-if="activeTab === 'quem_pode_competir'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'users']" />
              Quem Pode Competir
            </h3>
            <div class="content-box">
              <div v-html="competition.quem_pode_competir || 'Nenhuma informação disponível.'"></div>
            </div>
          </div>

          <!-- Cronograma -->
          <div v-if="activeTab === 'cronograma'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'clock']" />
              Cronograma
            </h3>
            <div class="content-box">
              <div v-html="competition.cronograma || 'Nenhum cronograma disponível.'"></div>
            </div>
          </div>

          <!-- Chaveamento -->
          <div v-if="activeTab === 'chaveamento'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'key']" />
              Chaveamento
            </h3>

            <!-- Filtro de Busca -->
            <div class="search-box-categoria mb-3">
              <div class="input-group">
                <span class="input-group-text">
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
                <input
                  v-model="searchCategoria"
                  type="text"
                  class="form-control"
                  placeholder="Buscar categoria..."
                  @input="handleSearchCategoria"
                >
                <button 
                  v-if="searchCategoria" 
                  class="btn btn-outline-secondary"
                  @click="clearSearchCategoria"
                >
                  <font-awesome-icon :icon="['fas', 'times']" />
                  Limpar
                </button>
              </div>
            </div>

            <div class="content-box">
              <!-- Loading -->
              <div v-if="loadingCategorias" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-2">Carregando categorias...</p>
              </div>

              <!-- Tabela de Categorias -->
              <div v-else-if="categorias.length > 0" class="table-responsive">
                <table class="table table-hover table-striped align-middle">
                  <thead class="table-dark">
                    <tr>
                      <th>Categoria</th>
                      <th>Idade</th>
                      <th>Sexo</th>
                      <th>Faixa</th>
                      <!-- <th>Peso</th>
                      <th>Competidores</th> -->
                      <th class="text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="categoria in categorias" :key="categoria.id">
                      <td><strong>{{ categoria.nome }}</strong></td>
                      <td>{{ categoria.idade_inicio }} - {{ categoria.idade_fim }} anos</td>
                      <td>{{ categoria.sexo }}</td>
                      <td>
                        <div class="faixas-container">
                          <span 
                            v-for="(faixa, index) in getFaixas(categoria.faixa)" 
                            :key="index"
                            class="badge faixa-badge me-1" 
                            :class="`faixa-${faixa.toLowerCase()}`"
                            :title="categoria.faixa"
                          >
                            {{ faixa }}
                          </span>
                        </div>
                      </td>
                      <!-- <td>{{ categoria.peso_categoria }}</td>
                      <td class="text-center">
                        <span class="badge bg-primary">{{ categoria.qtd_competidores }}</span>
                      </td> -->
                      <td class="text-center">
                        <button 
                          class="btn btn-sm btn-success"
                          @click="verChaveamento(categoria)"
                        >
                          <font-awesome-icon :icon="['fas', 'eye']" />
                          Ver Chaveamento
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Sem Resultados -->
              <div v-else class="text-center py-4">
                <font-awesome-icon :icon="['fas', 'info-circle']" class="fa-3x text-muted mb-3" />
                <p class="text-muted">
                  {{ searchCategoria ? 'Nenhuma categoria encontrada.' : 'Nenhuma categoria disponível.' }}
                </p>
                <button v-if="searchCategoria" class="btn btn-primary" @click="clearSearchCategoria">
                  <font-awesome-icon :icon="['fas', 'times']" />
                  Limpar Filtro
                </button>
              </div>
            </div>
          </div>

          <!-- Ingressos -->
          <div v-if="activeTab === 'ingressos'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'ticket-alt']" />
              Ingressos
            </h3>
            <div class="content-box">
              <div v-html="competition.ingressos || 'Nenhuma informação sobre ingressos disponível.'"></div>
            </div>
          </div>

          <!-- Premiação -->
          <div v-if="activeTab === 'premiacao'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'trophy']" />
              Premiação
            </h3>
            <div class="content-box">
              <div v-html="competition.premiacao || 'Nenhuma informação sobre premiação disponível.'"></div>
            </div>
          </div>

          <!-- Agrupamento -->
          <div v-if="activeTab === 'agrupamento'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'layer-group']" />
              Agrupamento
            </h3>
            <div class="content-box">
              <div v-html="competition.agrupamento || 'Nenhuma informação sobre agrupamento disponível.'"></div>
            </div>
          </div>

          <!-- Reembolso -->
          <div v-if="activeTab === 'reembolso'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'money-bill-wave']" />
              Reembolso
            </h3>
            <div class="content-box">
              <div v-html="competition.reembolso || 'Nenhuma informação sobre reembolso disponível.'"></div>
            </div>
          </div>

          <!-- Organização e Apoio -->
          <div v-if="activeTab === 'organizacao_apoio'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'hands-helping']" />
              Organização e Apoio
            </h3>
            <div class="content-box">
              <div v-html="competition.organizacao_apoio || 'Nenhuma informação disponível.'"></div>
            </div>
          </div>

          <!-- Regulamento -->
          <div v-if="activeTab === 'regulamento'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'file-contract']" />
              Regulamento
            </h3>
            <div class="content-box">
              <div v-html="competition.regulamento || 'Nenhum regulamento disponível.'"></div>
            </div>
          </div>

          <!-- Tabela de Pesos -->
          <div v-if="activeTab === 'tabela_pesos'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'weight']" />
              Tabela de Pesos
            </h3>
            <div class="content-box">
              <div v-if="competition.tabela_pesos_url">
                <!-- Se for PDF -->
                <div v-if="isPDF(competition.tabela_pesos_url)" class="pdf-container">
                  <!-- <div class="pdf-toolbar mb-3">
                    <button 
                      class="btn btn-primary"
                      @click="openPDFInNewTab(competition.tabela_pesos_url)"
                    >
                      <font-awesome-icon :icon="['fas', 'external-link-alt']" />
                      Abrir PDF em Nova Aba
                    </button>
                    <a 
                      :href="getFileUrl(competition.tabela_pesos_url)" 
                      download 
                      class="btn btn-success ms-2"
                    >
                      <font-awesome-icon :icon="['fas', 'download']" />
                      Baixar PDF
                    </a>
                  </div> -->
                  <iframe
                    :src="getFileUrl(competition.tabela_pesos_url)"
                    class="pdf-viewer"
                    frameborder="0"
                    title="Tabela de Pesos PDF"
                  ></iframe>
                </div>
                
                <!-- Se for imagem -->
                <img
                  v-else
                  :src="getFileUrl(competition.tabela_pesos_url)"
                  alt="Tabela de Pesos"
                  class="tabela-image"
                  @error="handleImageError"
                >
              </div>
              <p v-else class="text-muted">Nenhuma tabela de pesos disponível.</p>
            </div>
          </div>

          <!-- Mais Informações -->
          <div v-if="activeTab === 'mais_informacoes'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'plus-circle']" />
              Mais Informações
            </h3>
            <div class="content-box">
              <div v-html="competition.mais_informacoes || 'Nenhuma informação adicional disponível.'"></div>
            </div>
          </div>

          <div v-if="activeTab === 'resultado_geral'" class="tab-pane">
            <h3>
              <font-awesome-icon :icon="['fas', 'circle-check']" />
              Resultado Geral
            </h3>
            <div class="content-box">
              <div v-if="competition.resultado_geral_url">
                <!-- Se for PDF -->
                <div v-if="isPDF(competition.resultado_geral_url)" class="pdf-container">
                  <iframe
                    :src="getFileUrl(competition.resultado_geral_url)"
                    class="pdf-viewer"
                    frameborder="0"
                    title="Resultado geral"
                  ></iframe>
                </div>
              </div>
              <p v-else class="text-muted">Ainda não há resultado geral disponível</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Erro -->
    <div v-else class="text-center py-5">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="fa-4x text-warning mb-3" />
      <p class="text-muted">Competição não encontrada.</p>
      <button class="btn btn-primary" @click="goBack">
        Voltar para Lista
      </button>
    </div>
  </div>
</template>

<style scoped>
.competition-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.competition-detail {
  max-width: 1400px;
  margin: 0 auto;
}

.competition-header {
  width: 100%;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
}

.competition-main-image {
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  display: block;
}

.competition-title {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.competition-title h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.competition-title p {
  font-size: 1.1rem;
  margin: 0;
}

.inscription-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.inscription-actions .btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.inscription-actions .btn-success {
  background-color: #006517;
  border-color: #006517;
}

.inscription-actions .btn-success:hover {
  background-color: #004d11;
  border-color: #004d11;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 101, 23, 0.4);
}

.inscription-actions .btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.inscription-actions .btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
}

.inscription-actions .btn-info {
  background-color: #0dcaf0;
  border-color: #0dcaf0;
  color: #000;
}

.inscription-actions .btn-info:hover {
  background-color: #31d2f2;
  border-color: #25cff2;
  color: #000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 202, 240, 0.4);
}

/* Modal de Inscrições */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background-color: #e9ecef;
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.inscricoes-table {
  overflow-x: auto;
}

.inscricoes-table .table {
  margin-bottom: 0;
}

.inscricoes-table thead th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  padding: 1rem;
}

.inscricoes-table tbody td {
  padding: 1rem;
  vertical-align: middle;
}

.inscricoes-table tbody tr:hover {
  background-color: #f8f9fa;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e9ecef;
}

/* Responsivo Modal */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    max-height: 95vh;
  }

  .modal-header h3 {
    font-size: 1.2rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .inscricoes-table {
    font-size: 0.9rem;
  }

  .inscricoes-table thead th,
  .inscricoes-table tbody td {
    padding: 0.75rem 0.5rem;
  }

  .modal-footer-actions {
    flex-direction: column;
  }

  .modal-footer-actions .btn {
    width: 100%;
  }

  .inscription-actions {
    flex-direction: column;
  }

  .inscription-actions .btn {
    width: 100%;
  }
}

.competition-content {
  display: flex;
  gap: 2rem;
  min-height: 600px;
}

.tabs-sidebar {
  flex: 0 0 280px;
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.nav-pills .nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  color: #495057;
  font-weight: 500;
  text-align: left;
  transition: all 0.3s ease;
  border: none;
  background-color: transparent;
  width: 100%;
}

.nav-pills .nav-link:hover {
  background-color: #f8f9fa;
  color: #006517;
  transform: translateX(5px);
}

.nav-pills .nav-link.active {
  background-color: #006517;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 101, 23, 0.3);
}

.nav-pills .nav-link svg {
  width: 20px;
  height: 20px;
}

.tab-content-area {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  /* max-height: calc(100vh - 200px); */
}

.tab-pane {
  max-width: 100%;
  overflow-x: hidden;
}

.tab-pane h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #006517;
  word-wrap: break-word;
  word-break: break-word;
}

.content-box {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #006517;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  word-wrap: break-word;
  word-break: break-word;
}

/* Estilos para conteúdo HTML renderizado dentro do content-box */
.content-box :deep(p),
.content-box :deep(div),
.content-box :deep(span),
.content-box :deep(table),
.content-box :deep(pre),
.content-box :deep(code) {
  max-width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.content-box :deep(table) {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}

.content-box :deep(img) {
  max-width: 100%;
  height: auto;
}

.content-box :deep(pre) {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.info-item {
  margin-bottom: 1.5rem;
  max-width: 100%;
  overflow: hidden;
}

.info-item strong {
  display: block;
  color: #006517;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
}

.info-item p {
  margin: 0;
  color: #495057;
  font-size: 1rem;
  line-height: 1.6;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.pdf-container {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.pdf-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  border: 2px solid #006517;
}

.pdf-toolbar .btn {
  white-space: nowrap;
}

.pdf-viewer {
  width: 100%;
  height: 800px;
  border-radius: 8px;
  border: 2px solid #dee2e6;
  background-color: #fff;
  max-width: 100%;
}

.tabela-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  object-fit: contain;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Busca de Categoria */
.search-box-categoria .input-group {
  max-width: 600px;
}

.search-box-categoria .input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.search-box-categoria .form-control {
  border-left: none;
  border-right: none;
  padding: 0.75rem 1rem;
}

.search-box-categoria .form-control:focus {
  border-color: #006517;
  box-shadow: 0 0 0 0.2rem rgba(0, 101, 23, 0.25);
}

.search-box-categoria .btn-outline-secondary {
  border-left: none;
}

/* Container de Faixas */
.faixas-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

/* Badges de Faixa */
.faixa-badge {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: inline-block;
  white-space: nowrap;
}

.faixa-badge:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.faixa-badge[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  margin-bottom: 0.5rem;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.faixa-badge[title]:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #2c3e50;
  margin-bottom: 0.25rem;
  z-index: 1000;
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

/* Responsivo */
@media (max-width: 992px) {
  .competition-content {
    flex-direction: column;
  }

  .tabs-sidebar {
    flex: 1;
    position: relative;
    top: 0;
  }

  .nav-pills {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .nav-pills .nav-link {
    flex: 1 1 calc(50% - 0.5rem);
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .competition-detail-container {
    padding: 1rem;
  }

  .competition-header {
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .competition-main-image {
    border-radius: 8px;
  }

  .competition-title {
    padding: 1rem;
  }

  .competition-title h1 {
    font-size: 1.8rem;
  }

  .tab-pane h3 {
    font-size: 1.4rem;
    flex-wrap: wrap;
  }

  .nav-pills .nav-link {
    flex: 1 1 100%;
    font-size: 0.9rem;
  }

  .tab-content-area {
    padding: 1rem;
    max-height: calc(100vh - 150px);
  }

  .content-box {
    padding: 1rem;
  }

  .pdf-viewer {
    height: 500px;
  }

  .pdf-toolbar {
    flex-direction: column;
  }

  .pdf-toolbar .btn {
    width: 100%;
  }
}
</style>

<style>
/* Estilos globais para SweetAlert - Sem scoped para garantir que funcione */
body.swal2-shown > [aria-hidden="true"] {
  filter: none !important;
}

.swal2-container {
  z-index: 999999 !important;
}

.swal2-popup {
  z-index: 1000000 !important;
}

.swal2-backdrop-show {
  z-index: 999998 !important;
}
</style>

