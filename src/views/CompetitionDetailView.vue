<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
  [key: string]: any
}

const competition = ref<Competition | null>(null)
const loading = ref(false)
const activeTab = ref('informacoes_gerais')

const tabs = [
  { id: 'informacoes_gerais', label: 'Informações Gerais', icon: 'info-circle' },
  { id: 'agenda', label: 'Agenda', icon: 'calendar' },
  { id: 'endereco', label: 'Endereço', icon: 'map-marker-alt' },
  { id: 'quem_pode_competir', label: 'Quem Pode Competir', icon: 'users' },
  { id: 'cronograma', label: 'Cronograma', icon: 'clock' },
  { id: 'ingressos', label: 'Ingressos', icon: 'ticket-alt' },
  { id: 'premiacao', label: 'Premiação', icon: 'trophy' },
  { id: 'agrupamento', label: 'Agrupamento', icon: 'layer-group' },
  { id: 'reembolso', label: 'Reembolso', icon: 'money-bill-wave' },
  { id: 'organizacao_apoio', label: 'Organização e Apoio', icon: 'hands-helping' },
  { id: 'regulamento', label: 'Regulamento', icon: 'file-contract' },
  { id: 'tabela_pesos', label: 'Tabela de Pesos', icon: 'weight' },
  { id: 'mais_informacoes', label: 'Mais Informações', icon: 'plus-circle' }
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
      console.log(competition.value)
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
          <button class="btn btn-success btn-lg" @click="goToInscricao">
            <font-awesome-icon :icon="['fas', 'user-plus']" />
            Inscrever-se
          </button>
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
                  :src="getFileUrl(competition.tabela_pesos_tipo)"
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

