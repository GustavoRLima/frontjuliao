<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { competicaoService } from '@/services/api.service'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface Categoria {
  id: number
  descricao: string
  [key: string]: any
}

interface Atleta {
  id: number
  nome: string
  [key: string]: any
}

interface Inscricao {
  atleta_id?: number
  categoria_id: number
  atleta_nome?: string
  categoria_nome?: string
  categorias_disponiveis?: Categoria[]
  loading_categorias?: boolean
}

const competicaoId = ref<number>(0)
const competicaoNome = ref<string>('')
const categorias = ref<Categoria[]>([])
const atletas = ref<Atleta[]>([])
const inscricoes = ref<Inscricao[]>([])
const loading = ref(false)

// Para atleta logado - seleção simples de categorias
const categoriasSelecionadas = ref<number[]>([])
const loadingCategoriasAtleta = ref(false)

/**
 * Verificar se é equipe ou atleta
 */
const isEquipe = computed(() => authStore.isEquipe)
const isAtleta = computed(() => authStore.isCompetidor)

/**
 * Buscar dados da competição
 */
const fetchData = async () => {
  loading.value = true
  try {
    competicaoId.value = parseInt(route.params.id as string)

    // Buscar detalhes da competição
    const competicaoResponse = await competicaoService.getCompeticaoById(competicaoId.value)
    if (competicaoResponse.data) {
      competicaoNome.value = competicaoResponse.data.descricao
    }

    // Se for equipe, buscar atletas
    if (isEquipe.value) {
      const atletasResponse = await competicaoService.getAtletasEquipe()
      if (atletasResponse.data) {
        atletas.value = atletasResponse.data
      }
    } else {
      // Se for atleta, buscar categorias disponíveis para ele
      await buscarCategoriasAtleta()
    }
  } catch (error: any) {
    console.error('Erro ao carregar dados:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.response?.data?.message || 'Erro ao carregar dados da competição',
      confirmButtonText: 'OK'
    }).then(() => {
      router.push({ name: 'competitions' })
    })
  } finally {
    loading.value = false
  }
}

/**
 * Buscar categorias disponíveis para um atleta específico
 */
const buscarCategoriasParaAtleta = async (atletaId: number, inscricaoIndex: number) => {
  if (!atletaId) return

  const inscricao = inscricoes.value[inscricaoIndex]
  if (!inscricao) return
  
  inscricao.loading_categorias = true

  try {
    const response = await competicaoService.getCategorias(atletaId)
    if (response.data) {
      inscricao.categorias_disponiveis = response.data.categorias
    } else {
      inscricao.categorias_disponiveis = []
    }
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
    inscricao.categorias_disponiveis = []
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao buscar categorias do atleta.',
      confirmButtonText: 'OK'
    })
  } finally {
    inscricao.loading_categorias = false
  }
}

/**
 * Buscar categorias para o atleta logado
 */
const buscarCategoriasAtleta = async () => {
  loadingCategoriasAtleta.value = true
  try {
    const atletaId = authStore.userData?.id
    if (!atletaId) {
      throw new Error('ID do atleta não encontrado')
    }

    const response = await competicaoService.getCategorias(atletaId)
    if (response.data) {
      categorias.value = response.data.categorias
    }
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao buscar categorias disponíveis.',
      confirmButtonText: 'OK'
    })
  } finally {
    loadingCategoriasAtleta.value = false
  }
}

/**
 * Quando atleta é selecionado (para equipe)
 */
const onAtletaChange = async (inscricaoIndex: number) => {
  const inscricao = inscricoes.value[inscricaoIndex]
  if (!inscricao) return
  
  // Limpar categoria selecionada
  inscricao.categoria_id = 0
  inscricao.categorias_disponiveis = []

  // Buscar categorias do atleta selecionado
  if (inscricao.atleta_id) {
    await buscarCategoriasParaAtleta(inscricao.atleta_id, inscricaoIndex)
  }
}

/**
 * Adicionar inscrição (para equipe)
 */
const adicionarInscricao = () => {
  inscricoes.value.push({
    atleta_id: undefined,
    categoria_id: 0,
    categorias_disponiveis: [],
    loading_categorias: false
  })
}

/**
 * Remover inscrição (para equipe)
 */
const removerInscricao = (index: number) => {
  inscricoes.value.splice(index, 1)
}

/**
 * Validar se já existe a combinação atleta + categoria
 */
const validarDuplicataEquipe = (): boolean => {
  const combinacoes = new Set<string>()
  
  for (const inscricao of inscricoes.value) {
    if (!inscricao.atleta_id || !inscricao.categoria_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Por favor, preencha todos os campos de atleta e categoria.',
        confirmButtonText: 'OK'
      })
      return false
    }

    const chave = `${inscricao.atleta_id}-${inscricao.categoria_id}`
    if (combinacoes.has(chave)) {
      const atleta = atletas.value.find(a => a.id === inscricao.atleta_id)
      const categoria = categorias.value.find(c => c.id === inscricao.categoria_id)
      
      Swal.fire({
        icon: 'warning',
        title: 'Inscrição Duplicada',
        text: `O atleta ${atleta?.nome} já está inscrito na categoria ${categoria?.descricao}.`,
        confirmButtonText: 'OK'
      })
      return false
    }
    
    combinacoes.add(chave)
  }
  
  return true
}

/**
 * Validar se já existe categoria selecionada (para atleta)
 */
const validarDuplicataAtleta = (): boolean => {
  if (categoriasSelecionadas.value.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Atenção',
      text: 'Por favor, selecione pelo menos uma categoria.',
      confirmButtonText: 'OK'
    })
    return false
  }

  const unique = new Set(categoriasSelecionadas.value)
  if (unique.size !== categoriasSelecionadas.value.length) {
    Swal.fire({
      icon: 'warning',
      title: 'Categoria Duplicada',
      text: 'Você selecionou a mesma categoria mais de uma vez.',
      confirmButtonText: 'OK'
    })
    return false
  }

  return true
}

/**
 * Adicionar categoria (para atleta)
 */
const adicionarCategoria = () => {
  categoriasSelecionadas.value.push(0)
}

/**
 * Remover categoria (para atleta)
 */
const removerCategoria = (index: number) => {
  categoriasSelecionadas.value.splice(index, 1)
}

/**
 * Submeter inscrição
 */
const submeterInscricao = async () => {
  loading.value = true

  try {
    let dadosInscricao: any = {
      competicao_id: competicaoId.value
    }

    if (isEquipe.value) {
      // Validar duplicatas para equipe
      if (!validarDuplicataEquipe()) {
        loading.value = false
        return
      }

      dadosInscricao.inscricoes = inscricoes.value.map(insc => ({
        atleta_id: insc.atleta_id,
        categoria_id: insc.categoria_id
      }))
    } else {
      // Validar duplicatas para atleta
      if (!validarDuplicataAtleta()) {
        loading.value = false
        return
      }

      dadosInscricao.categorias = categoriasSelecionadas.value
      dadosInscricao.competidor_id = authStore.userData?.id
    }

    await competicaoService.criarInscricao(dadosInscricao)

    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: 'Inscrição realizada com sucesso!',
      confirmButtonText: 'OK'
    }).then(() => {
      router.push({ name: 'competitions' })
    })
  } catch (error: any) {
    console.error('Erro ao realizar inscrição:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.response?.data?.message || 'Erro ao realizar inscrição. Tente novamente.',
      confirmButtonText: 'OK'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Voltar para lista de competições
 */
const voltar = () => {
  router.push({ name: 'competitions' })
}

/**
 * Obter nome da categoria
 */
const getCategoriaNome = (id: number): string => {
  const cat = categorias.value.find(c => c.id === id)
  return cat ? cat.descricao : ''
}

/**
 * Obter nome do atleta
 */
const getAtletaNome = (id: number): string => {
  const atl = atletas.value.find(a => a.id === id)
  return atl ? atl.nome : ''
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="inscription-container">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3">Carregando...</p>
    </div>

    <!-- Formulário -->
    <div v-else class="inscription-form">
      <!-- Header -->
      <div class="form-header">
        <button class="btn btn-secondary mb-3" @click="voltar">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          Voltar
        </button>
        
        <h2>Inscrição na Competição</h2>
        <h4 class="text-muted">{{ competicaoNome }}</h4>
        <p class="user-type-badge">
          <span v-if="isEquipe" class="badge bg-primary">
            <font-awesome-icon :icon="['fas', 'users']" />
            Equipe: {{ authStore.userName }}
          </span>
          <span v-else class="badge bg-success">
            <font-awesome-icon :icon="['fas', 'user']" />
            Atleta: {{ authStore.userName }}
          </span>
        </p>
      </div>

      <!-- Formulário para EQUIPE -->
      <div v-if="isEquipe" class="equipe-form">
        <div class="alert alert-info">
          <font-awesome-icon :icon="['fas', 'info-circle']" />
          Adicione os atletas e suas respectivas categorias. Um mesmo atleta pode participar de múltiplas categorias.
        </div>

        <!-- Lista de Inscrições -->
        <div v-if="inscricoes.length > 0" class="inscricoes-list">
          <div 
            v-for="(inscricao, index) in inscricoes" 
            :key="index"
            class="inscricao-item"
          >
            <div class="row align-items-end">
              <div class="col-md-5">
                <label :for="`atleta-${index}`" class="form-label">
                  <font-awesome-icon :icon="['fas', 'user']" />
                  Atleta
                </label>
                <select 
                  :id="`atleta-${index}`"
                  v-model="inscricao.atleta_id"
                  class="form-select"
                  @change="onAtletaChange(index)"
                  required
                >
                  <option :value="undefined" disabled>Selecione um atleta</option>
                  <option 
                    v-for="atleta in atletas" 
                    :key="atleta.id"
                    :value="atleta.id"
                  >
                    {{ atleta.nome }}
                  </option>
                </select>
              </div>

              <div class="col-md-5">
                <label :for="`categoria-${index}`" class="form-label">
                  <font-awesome-icon :icon="['fas', 'layer-group']" />
                  Categoria
                  <span v-if="inscricao.loading_categorias" class="spinner-border spinner-border-sm ms-2" role="status"></span>
                </label>
                <select 
                  :id="`categoria-${index}`"
                  v-model="inscricao.categoria_id"
                  class="form-select"
                  :disabled="!inscricao.atleta_id || inscricao.loading_categorias || !inscricao.categorias_disponiveis || inscricao.categorias_disponiveis.length === 0"
                  required
                >
                  <option :value="0" disabled>
                    {{ !inscricao.atleta_id ? 'Selecione um atleta primeiro' : 
                       inscricao.loading_categorias ? 'Carregando categorias...' :
                       (!inscricao.categorias_disponiveis || inscricao.categorias_disponiveis.length === 0) ? 'Nenhuma categoria disponível' :
                       'Selecione uma categoria' }}
                  </option>
                  <option 
                    v-for="categoria in inscricao.categorias_disponiveis" 
                    :key="categoria.id"
                    :value="categoria.id"
                  >
                    {{ categoria.name }} <span v-if="categoria.peso_inicio > 0">( {{ categoria.peso_inicio }} - {{ categoria.peso_fim }} kg ) </span>
                  </option>
                </select>
              </div>

              <div class="col-md-2">
                <button 
                  type="button"
                  class="btn btn-danger w-100"
                  @click="removerInscricao(index)"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" />
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Botão Adicionar -->
        <button 
          type="button"
          class="btn btn-outline-primary mt-3"
          @click="adicionarInscricao"
        >
          <font-awesome-icon :icon="['fas', 'plus']" />
          Adicionar Atleta
        </button>
      </div>

      <!-- Formulário para ATLETA -->
      <div v-else class="atleta-form">
        <div class="alert alert-info">
          <font-awesome-icon :icon="['fas', 'info-circle']" />
          Selecione as categorias nas quais deseja se inscrever.
        </div>

        <!-- Loading Categorias -->
        <div v-if="loadingCategoriasAtleta" class="text-center py-3">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando categorias...</span>
          </div>
          <p class="mt-2">Carregando categorias disponíveis...</p>
        </div>

        <!-- Sem Categorias Disponíveis -->
        <div v-else-if="categorias.length === 0" class="alert alert-warning">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
          Nenhuma categoria disponível para você nesta competição.
        </div>

        <!-- Lista de Categorias -->
        <div v-else>
          <div v-if="categoriasSelecionadas.length > 0" class="categorias-list">
            <div 
              v-for="(categoriaId, index) in categoriasSelecionadas" 
              :key="index"
              class="categoria-item"
            >
              <div class="row align-items-end">
                <div class="col-md-10">
                  <label :for="`categoria-${index}`" class="form-label">
                    <font-awesome-icon :icon="['fas', 'layer-group']" />
                    Categoria {{ index + 1 }}
                  </label>
                  <select 
                    :id="`categoria-${index}`"
                    v-model="categoriasSelecionadas[index]"
                    class="form-select"
                    required
                  >
                    <option :value="0" disabled>Selecione uma categoria</option>
                    <option 
                      v-for="categoria in categorias" 
                      :key="categoria.id"
                      :value="categoria.id"
                    >
                      {{ categoria.name }} <span v-if="categoria.peso_inicio > 0">( {{ categoria.peso_inicio }} - {{ categoria.peso_fim }} peso ) </span>
                    </option>
                  </select>
                </div>

                <div class="col-md-2">
                  <button 
                    type="button"
                    class="btn btn-danger w-100"
                    @click="removerCategoria(index)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Botão Adicionar -->
          <button 
            type="button"
            class="btn btn-outline-primary mt-3"
            @click="adicionarCategoria"
            :disabled="loadingCategoriasAtleta"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
            Adicionar Categoria
          </button>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div class="form-actions mt-4">
        <button 
          type="button"
          class="btn btn-secondary"
          @click="voltar"
        >
          Cancelar
        </button>
        <button 
          type="button"
          class="btn btn-success"
          @click="submeterInscricao"
          :disabled="loading || (isEquipe && inscricoes.length === 0) || (isAtleta && categoriasSelecionadas.length === 0)"
        >
          <font-awesome-icon :icon="['fas', 'check']" />
          Confirmar Inscrição
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inscription-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.inscription-form {
  max-width: 1000px;
  margin: 0 auto;
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #006517;
}

.form-header h2 {
  color: #2c3e50;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.form-header h4 {
  font-weight: 500;
  margin-bottom: 1rem;
}

.user-type-badge {
  margin-bottom: 0;
}

.user-type-badge .badge {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.inscricoes-list,
.categorias-list {
  margin-bottom: 1rem;
}

.inscricao-item,
.categoria-item {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #006517;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-label svg {
  margin-right: 0.5rem;
  color: #006517;
}

.form-select {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: #006517;
  box-shadow: 0 0 0 0.2rem rgba(0, 101, 23, 0.25);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-success {
  background-color: #006517;
  border-color: #006517;
}

.btn-success:hover:not(:disabled) {
  background-color: #004d11;
  border-color: #004d11;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 101, 23, 0.3);
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline-primary {
  color: #006517;
  border-color: #006517;
}

.btn-outline-primary:hover {
  background-color: #006517;
  border-color: #006517;
  color: white;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Responsivo */
@media (max-width: 768px) {
  .inscription-container {
    padding: 1rem;
  }

  .inscription-form {
    padding: 1rem;
  }

  .inscricao-item,
  .categoria-item {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>

