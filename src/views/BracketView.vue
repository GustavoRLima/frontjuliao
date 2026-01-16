<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { competicaoService } from '@/services/api.service'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

interface Competidor {
  id: number
  nome: string
  equipe: string
  equipe_id: number
  faixa: string
  sexo: number
  vitorias: number
  derrota: number
  grupo: number
  categoria_id: number
  competicao_id: number
}

interface Competition {
  descricao: string
}

interface Match {
  posicao: number
  competidor1?: Competidor
  competidor2?: Competidor
}

interface BracketData {
    competicao: Competition
    categoriaNome: string
    competidores1: Competidor[]
    competidores2: Competidor[]
    resultados?: string[]
}

const loading = ref(false)
const bracketData = ref<BracketData | null>(null)

/**
 * Buscar dados do chaveamento
 */
const fetchBracketData = async () => {
  loading.value = true
  try {
    const competicaoId = parseInt(route.params.competicaoId as string)
    const categoriaId = parseInt(route.params.categoriaId as string)
    const faixaId = route.params.faixaId as string
    console.log('faixaId:', faixaId);
    const response = await competicaoService.getChaveamentoCategoria(competicaoId, categoriaId, faixaId)
    
    if (response.data) {
      bracketData.value = response.data
    }
  } catch (error: any) {
    console.error('Erro ao buscar chaveamento:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: error.response?.data?.message || 'Erro ao buscar chaveamento.',
      confirmButtonText: 'OK'
    }).then(() => {
      router.back()
    })
  } finally {
    loading.value = false
  }
}

/**
 * Obter competidor por índice do array competidores1
 */
const getCompetidor1 = (index: number): Competidor | undefined => {
  return bracketData.value?.competidores1[index]
}

/**
 * Obter competidor por índice do array competidores2
 */
const getCompetidor2 = (index: number): Competidor | undefined => {
  return bracketData.value?.competidores2[index]
}

/**
 * Agrupar competidores em pares para os confrontos
 */
const groupCompetitorsInPairs = (competitors: Competidor[] | undefined) => {
  if (!competitors || competitors.length === 0) return []
  
  const pairs: Array<{ comp1: Competidor | null, comp2: Competidor | null }> = []
  
  for (let i = 0; i < competitors.length; i += 2) {
    pairs.push({
      comp1: competitors[i] || null,
      comp2: competitors[i + 1] || null
    })
  }
  
  return pairs
}

/**
 * Pares de competidores do lado esquerdo
 */
const leftPairs = computed(() => {
  return groupCompetitorsInPairs(bracketData.value?.competidores1)
})

/**
 * Pares de competidores do lado direito
 */
const rightPairs = computed(() => {
  return groupCompetitorsInPairs(bracketData.value?.competidores2)
})

/**
 * Calcular número de rodadas necessárias para cada lado
 */
const numRounds = computed(() => {
  if (!bracketData.value) return 0
  const maxPairs = Math.max(
    leftPairs.value.length,
    rightPairs.value.length
  )
  if (maxPairs === 0) return 0
  return Math.ceil(Math.log2(maxPairs)) + 1 // +1 para incluir a rodada inicial de confrontos
})

/**
 * Obter nome da rodada baseado no número de rodadas até a final
 */
const getRoundName = (roundsUntilFinal: number): string => {
  if (roundsUntilFinal === 1) return 'Semifinais'
  if (roundsUntilFinal === 2) return 'Quartas de Final'
  if (roundsUntilFinal === 3) return 'Oitavas de Final'
  if (roundsUntilFinal === 4) return '16avos de Final'
  if (roundsUntilFinal === 5) return '32avos de Final'
  return 'Primeira Rodada'
}

/**
 * Calcular quantos matches vazios devem existir em uma rodada
 */
const getEmptyMatchesCount = (roundNumber: number): number => {
  // roundNumber: 1 = primeira rodada após os pares, 2 = segunda rodada, etc
  const maxPairs = Math.max(leftPairs.value.length, rightPairs.value.length)
  if (maxPairs === 0) return 0
  return Math.pow(2, Math.ceil(Math.log2(maxPairs)) - roundNumber)
}

/**
 * Obter o vencedor de um par de competidores baseado no número de vitórias
 * Também permite avanço automático quando há apenas um competidor (walkover)
 */
const getWinnerFromPair = (comp1: Competidor | null, comp2: Competidor | null): Competidor | null => {
  if (!comp1 && !comp2) return null
  // Se só tem um competidor, ele avança automaticamente (walkover/WO)
  if (!comp1) return comp2
  if (!comp2) return comp1
  
  // Se pelo menos um tem vitórias, retorna quem tem mais
  if (comp1.vitorias > 0 || comp2.vitorias > 0) {
    return comp1.vitorias >= comp2.vitorias ? comp1 : comp2
  }
  
  // Se nenhum tem vitórias, não avança ninguém (aguardando luta)
  return null
}

/**
 * Construir os confrontos para uma rodada específica do lado esquerdo
 */
const getLeftRoundMatches = (roundNumber: number): (Competidor | null)[] => {
  if (roundNumber === 0) {
    // Primeira rodada - vencedores dos pares iniciais
    return leftPairs.value.map(pair => getWinnerFromPair(pair.comp1, pair.comp2))
  }
  
  // Rodadas seguintes - vencedores da rodada anterior
  const previousRound = getLeftRoundMatches(roundNumber - 1)
  const matches: (Competidor | null)[] = []
  
  for (let i = 0; i < previousRound.length; i += 2) {
    const comp1 = previousRound[i] ?? null
    const comp2 = previousRound[i + 1] ?? null
    const winner = getWinnerFromPair(comp1, comp2)
    matches.push(winner)
  }
  
  return matches
}

/**
 * Construir os confrontos para uma rodada específica do lado direito
 */
const getRightRoundMatches = (roundNumber: number): (Competidor | null)[] => {
  if (roundNumber === 0) {
    // Primeira rodada - vencedores dos pares iniciais
    return rightPairs.value.map(pair => getWinnerFromPair(pair.comp1, pair.comp2))
  }
  
  // Rodadas seguintes - vencedores da rodada anterior
  const previousRound = getRightRoundMatches(roundNumber - 1)
  const matches: (Competidor | null)[] = []
  
  for (let i = 0; i < previousRound.length; i += 2) {
    const comp1 = previousRound[i] ?? null
    const comp2 = previousRound[i + 1] ?? null
    const winner = getWinnerFromPair(comp1, comp2)
    matches.push(winner)
  }
  
  return matches
}

/**
 * Agrupar competidores em pares para as rodadas intermediárias
 */
const groupRoundCompetitorsInPairs = (competitors: (Competidor | null)[]) => {
  const pairs: Array<{ comp1: Competidor | null, comp2: Competidor | null }> = []
  
  for (let i = 0; i < competitors.length; i += 2) {
    pairs.push({
      comp1: competitors[i] ?? null,
      comp2: competitors[i + 1] ?? null
    })
  }
  
  return pairs
}

/**
 * Obter pares de competidores para uma rodada específica do lado esquerdo
 */
const getLeftRoundPairs = (roundNumber: number) => {
  const matches = getLeftRoundMatches(roundNumber)
  return groupRoundCompetitorsInPairs(matches)
}

/**
 * Obter pares de competidores para uma rodada específica do lado direito
 */
const getRightRoundPairs = (roundNumber: number) => {
  const matches = getRightRoundMatches(roundNumber)
  return groupRoundCompetitorsInPairs(matches)
}

/**
 * Obter os finalistas (um de cada lado do bracket)
 */
const getFinalists = computed(() => {
  // Casos especiais com poucos competidores
  const leftCompetidores = bracketData.value?.competidores1 || []
  const rightCompetidores = bracketData.value?.competidores2 || []
  
  // Se houver apenas 1 competidor de um lado, ele vai direto para a final
  if (leftCompetidores.length === 1 && rightCompetidores.length === 0 && leftCompetidores[0]) {
    return { left: leftCompetidores[0], right: null }
  }
  
  if (rightCompetidores.length === 1 && leftCompetidores.length === 0 && rightCompetidores[0]) {
    return { left: null, right: rightCompetidores[0] }
  }
  
  if (leftCompetidores.length === 1 && rightCompetidores.length === 1 && leftCompetidores[0] && rightCompetidores[0]) {
    return { left: leftCompetidores[0], right: rightCompetidores[0] }
  }
  
  // Se houver apenas 1 par de cada lado (2 competidores), o vencedor vai para a final
  if (leftPairs.value.length === 1 && leftPairs.value[0]) {
    const leftWinner = getWinnerFromPair(leftPairs.value[0].comp1, leftPairs.value[0].comp2)
    
    if (rightPairs.value.length === 1 && rightPairs.value[0]) {
      const rightWinner = getWinnerFromPair(rightPairs.value[0].comp1, rightPairs.value[0].comp2)
      return { left: leftWinner, right: rightWinner }
    }
    
    if (rightPairs.value.length === 0) {
      return { left: leftWinner, right: null }
    }
  }
  
  if (rightPairs.value.length === 1 && leftPairs.value.length === 0 && rightPairs.value[0]) {
    const rightWinner = getWinnerFromPair(rightPairs.value[0].comp1, rightPairs.value[0].comp2)
    return { left: null, right: rightWinner }
  }
  
  // Para casos com mais competidores, usar a lógica normal
  const totalRounds = numRounds.value - 1
  
  if (totalRounds === 0) {
    return { left: null, right: null }
  }
  
  const leftMatches = getLeftRoundMatches(totalRounds - 1)
  const rightMatches = getRightRoundMatches(totalRounds - 1)
  
  return {
    left: leftMatches.length > 0 ? leftMatches[0] : null,
    right: rightMatches.length > 0 ? rightMatches[0] : null
  }
})

/**
 * Calcular os resultados finais baseados nas vitórias
 */
const resultadosFinais = computed(() => {
  if (!bracketData.value) return []
  
  // Combinar todos os competidores
  const todosCompetidores = [
    ...(bracketData.value.competidores1 || []),
    ...(bracketData.value.competidores2 || [])
  ]
  
  // Ordenar por vitórias (decrescente)
  const competidoresOrdenados = todosCompetidores
    .filter(comp => comp.vitorias > 0) // Apenas competidores com vitórias
    .sort((a, b) => b.vitorias - a.vitorias)
  
  // Criar array de resultados
  const resultados: string[] = []
  
  if (competidoresOrdenados.length > 0 && competidoresOrdenados[0]) {
    // 1º Lugar - Campeão
    resultados.push(`${competidoresOrdenados[0].nome} - ${competidoresOrdenados[0].equipe}`)
  }
  
  if (competidoresOrdenados.length > 1 && competidoresOrdenados[1]) {
    // 2º Lugar
    resultados.push(`${competidoresOrdenados[1].nome} - ${competidoresOrdenados[1].equipe}`)
  }
  
  if (competidoresOrdenados.length > 2 && competidoresOrdenados[2]) {
    // 3º Lugar (primeiro)
    resultados.push(`${competidoresOrdenados[2].nome} - ${competidoresOrdenados[2].equipe}`)
  }
  
  if (competidoresOrdenados.length > 3 && competidoresOrdenados[3]) {
    // 3º Lugar (segundo)
    resultados.push(`${competidoresOrdenados[3].nome} - ${competidoresOrdenados[3].equipe}`)
  }
  
  return resultados
})

/**
 * Voltar para página anterior
 */
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchBracketData()
})
</script>

<template>
  <div class="bracket-container">
    <!-- Loading -->
    <div v-if="loading" class="loading-section">
      <div class="spinner-border text-white" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3 text-white">Carregando chaveamento...</p>
    </div>

    <!-- Conteúdo -->
    <div v-else-if="bracketData" class="bracket-content">
      <!-- Cabeçalho -->
      <div class="bracket-header">
        <button class="btn-back" @click="goBack">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          Voltar
        </button>
        <div class="bracket-title-box">
          <h1 class="bracket-title">{{ bracketData.competicao?.descricao }}</h1>
          <h2 class="bracket-subtitle">{{ bracketData.categoriaNome }}</h2>
        </div>
      </div>

      <!-- Chaveamento com scroll -->
      <div class="bracket-scroll-container">
        <div class="bracket-wrapper">
          <div class="bracket">
            <!-- Lado Esquerdo - Primeira Rodada (Competidores Agrupados) -->
            <div class="bracket-column">
              <!-- <div class="round-header">{{ getRoundName(numRounds) }}</div> -->
              
              <div class="matches-container">
                <div 
                  v-for="(pair, pairIndex) in leftPairs" 
                  :key="`left-pair-${pairIndex}`"
                  class="match-group"
                >
                  <div class="match-pair">
                    <!-- Competidor 1 do par -->
                    <div class="match-item">
                      <div class="match-number">{{ pairIndex * 2 + 1 }}</div>
                      <div class="competitor-box" :class="{ 'empty': !pair.comp1 }">
                        <template v-if="pair.comp1">
                          <div class="competitor-name">{{ pair.comp1.nome }}</div>
                          <div class="competitor-team">{{ pair.comp1.equipe }}</div>
                        </template>
                      </div>
                    </div>
                    
                    <!-- Competidor 2 do par -->
                    <div class="match-item">
                      <div class="match-number">{{ pairIndex * 2 + 2 }}</div>
                      <div class="competitor-box" :class="{ 'empty': !pair.comp2 }">
                        <template v-if="pair.comp2">
                          <div class="competitor-name">{{ pair.comp2.nome }}</div>
                          <div class="competitor-team">{{ pair.comp2.equipe }}</div>
                        </template>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Linha conectora do grupo para próxima rodada -->
                  <div class="connector-line right group-connector"></div>
                </div>
              </div>
            </div>

            <!-- Lado Esquerdo - Rodadas Intermediárias -->
            <template v-for="round in (numRounds - 1)" :key="`left-round-${round}`">
              <div class="bracket-column" :class="{ 'semifinals': round === numRounds - 1 }">
                <!-- <div class="round-header">{{ getRoundName(numRounds - round) }}</div> -->
                
                <div class="matches-container" :style="{ 
                  paddingTop: round > 1 ? `${Math.pow(2, round - 1) * 1.5}rem` : '0'
                }">
                  <div 
                    v-for="(pair, pairIndex) in getLeftRoundPairs(round - 1)" 
                    :key="`left-round-pair-${round}-${pairIndex}`"
                    class="match-group"
                    :style="{ marginBottom: round > 1 ? `${Math.pow(2, round - 1) * 1}rem` : '1.5rem' }"
                  >
                    <div class="match-pair">
                      <!-- Competidor 1 do par -->
                      <div class="match-item">
                        <div class="competitor-box small" :class="{ 'empty': !pair.comp1 }">
                          <template v-if="pair.comp1">
                            <div class="competitor-name">{{ pair.comp1.nome }}</div>
                            <div class="competitor-team">{{ pair.comp1.equipe }}</div>
                          </template>
                        </div>
                      </div>
                      
                      <!-- Competidor 2 do par -->
                      <div class="match-item">
                        <div class="competitor-box small" :class="{ 'empty': !pair.comp2 }">
                          <template v-if="pair.comp2">
                            <div class="competitor-name">{{ pair.comp2.nome }}</div>
                            <div class="competitor-team">{{ pair.comp2.equipe }}</div>
                          </template>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Linha conectora do grupo para próxima rodada -->
                    <div class="connector-line right group-connector" v-if="round < numRounds - 1"></div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Final -->
            <div class="bracket-column final-column">
              <div class="final-wrapper">
                <div class="final-match">
                  <div class="competitor-box small" :class="{ 'empty': !getFinalists.left }">
                    <template v-if="getFinalists.left">
                      <div class="competitor-name">{{ getFinalists.left.nome }}</div>
                      <div class="competitor-team">{{ getFinalists.left.equipe }}</div>
                    </template>
                  </div>
                  <div class="final-badge">FINAL</div>
                  <div class="competitor-box small" :class="{ 'empty': !getFinalists.right }">
                    <template v-if="getFinalists.right">
                      <div class="competitor-name">{{ getFinalists.right.nome }}</div>
                      <div class="competitor-team">{{ getFinalists.right.equipe }}</div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lado Direito - Rodadas Intermediárias -->
            <template v-for="round in (numRounds - 1)" :key="`right-round-${round}`">
              <div class="bracket-column" :class="{ 'semifinals': round === 1 }">
                <!-- <div class="round-header">{{ getRoundName(round + 1) }}</div> -->
                
                <div class="matches-container" :style="{ 
                  paddingTop: (numRounds - round) > 1 ? `${Math.pow(2, numRounds - round - 1) * 1.5}rem` : '0'
                }">
                  <div 
                    v-for="(pair, pairIndex) in getRightRoundPairs(numRounds - round - 1)" 
                    :key="`right-round-pair-${round}-${pairIndex}`"
                    class="match-group"
                    :style="{ marginBottom: (numRounds - round) > 1 ? `${Math.pow(2, numRounds - round - 1) * 1}rem` : '1.5rem' }"
                  >
                    <!-- Linha conectora do grupo vindo da rodada anterior -->
                    <div class="connector-line left group-connector" v-if="round > 1"></div>
                    
                    <div class="match-pair">
                      <!-- Competidor 1 do par -->
                      <div class="match-item right-side">
                        <div class="competitor-box small" :class="{ 'empty': !pair.comp1 }">
                          <template v-if="pair.comp1">
                            <div class="competitor-name">{{ pair.comp1.nome }}</div>
                            <div class="competitor-team">{{ pair.comp1.equipe }}</div>
                          </template>
                        </div>
                      </div>
                      
                      <!-- Competidor 2 do par -->
                      <div class="match-item right-side">
                        <div class="competitor-box small" :class="{ 'empty': !pair.comp2 }">
                          <template v-if="pair.comp2">
                            <div class="competitor-name">{{ pair.comp2.nome }}</div>
                            <div class="competitor-team">{{ pair.comp2.equipe }}</div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Lado Direito - Primeira Rodada (Competidores Agrupados) -->
            <div class="bracket-column">
              <!-- <div class="round-header">{{ getRoundName(numRounds) }}</div> -->
              
              <div class="matches-container">
                <div 
                  v-for="(pair, pairIndex) in rightPairs" 
                  :key="`right-pair-${pairIndex}`"
                  class="match-group"
                >
                  <!-- Linha conectora do grupo vindo da rodada anterior -->
                  <div class="connector-line left group-connector"></div>
                  
                  <div class="match-pair">
                    <!-- Competidor 1 do par -->
                    <div class="match-item right-side">
                      <div class="competitor-box" :class="{ 'empty': !pair.comp1 }">
                        <template v-if="pair.comp1">
                          <div class="competitor-name">{{ pair.comp1.nome }}</div>
                          <div class="competitor-team">{{ pair.comp1.equipe }}</div>
                        </template>
                      </div>
                      <div class="match-number">{{ (bracketData?.competidores1?.length || 0) + pairIndex * 2 + 1 }}</div>
                    </div>
                    
                    <!-- Competidor 2 do par -->
                    <div class="match-item right-side">
                      <div class="competitor-box" :class="{ 'empty': !pair.comp2 }">
                        <template v-if="pair.comp2">
                          <div class="competitor-name">{{ pair.comp2.nome }}</div>
                          <div class="competitor-team">{{ pair.comp2.equipe }}</div>
                        </template>
                      </div>
                      <div class="match-number">{{ (bracketData?.competidores1?.length || 0) + pairIndex * 2 + 2 }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados Abaixo do Chaveamento -->
      <div class="results-section-bottom" v-if="resultadosFinais.length > 0">
        <div class="results-box">
          <div class="results-header">RESULTADOS</div>
          <div class="results-list">
            <div class="result-row" v-for="(resultado, index) in resultadosFinais" :key="index">
              <span class="result-pos">{{ index < 2 ? index + 1 : 3 }}</span>
              <span class="result-text">{{ resultado }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.bracket-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  padding: 1rem;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.bracket-content {
  max-width: 100%;
  margin: 0 auto;
}

.bracket-header {
  position: relative;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-back {
  align-self: flex-start;
  background: white;
  border: 2px solid #28a745;
  color: #28a745;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.btn-back:hover {
  background: #28a745;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.bracket-title-box {
  background: white;
  border: 2px solid #333;
  padding: 1rem 1.5rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.bracket-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  text-transform: uppercase;
  line-height: 1.3;
}

.bracket-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
}

.bracket-scroll-container {
  overflow-x: auto;
  overflow-y: auto;
  padding: 1rem 0;
  max-height: calc(100vh - 250px);
}

.bracket-scroll-container::-webkit-scrollbar {
  height: 10px;
}

.bracket-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.bracket-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.bracket-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7);
}

.bracket-wrapper {
  background: white;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: fit-content;
}

.bracket {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: center;
}

.bracket-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 220px;
}

.bracket-column.semifinals {
  min-width: 100px;
}

.bracket-column:not(.final-column) {
  min-width: 220px;
}

.bracket-column.final-column {
  min-width: 150px;
}

.round-header {
  text-align: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #28a745;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.matches-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.matches-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.match-group {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.match-pair {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  flex: 1;
}

.match-pair::before {
  content: '';
  position: absolute;
  right: -0.375rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: calc(100% + 0.5rem);
  background: #28a745;
}

.match-group:has(.right-side) .match-pair::before {
  right: auto;
  left: -0.375rem;
}

.match-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.match-item.right-side {
  flex-direction: row;
}

.match-item.empty-match {
  position: relative;
}

.group-connector {
  width: 30px;
  z-index: 1;
}

.match-number {
  width: 28px;
  height: 28px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(40, 167, 69, 0.4);
}

.competitor-box {
  border: 2px solid #333;
  padding: 0.6rem 0.8rem;
  background: white;
  min-height: 55px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.competitor-box:hover:not(.empty) {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.competitor-box.empty {
  background: #f8f9fa;
  border-style: dashed;
  border-color: #ccc;
}

.competitor-box.small {
  min-height: 45px;
  padding: 0.5rem 0.7rem;
}

.competitor-name {
  font-weight: bold;
  font-size: 0.8rem;
  color: #333;
  margin-bottom: 0.2rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.competitor-team {
  font-size: 0.7rem;
  color: #666;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Linhas Conectoras */
.connector-line {
  width: 30px;
  height: 2px;
  background: #28a745;
  position: relative;
  flex-shrink: 0;
}

.connector-line.right::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid #28a745;
}

.connector-line.left::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 6px solid #28a745;
}

/* Semifinais */
.semi-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.semi-group.top-semi {
  margin-bottom: 6.5rem;
}

.semi-group {
  margin-top: 1.5rem;
}

/* Ajustes dinâmicos para múltiplas rodadas */
.bracket-column:has(.matches-container > .match-group:nth-child(n+5)) .matches-container {
  gap: 1rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+5)) .match-pair {
  gap: 0.4rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+5)) .competitor-box {
  min-height: 45px;
  padding: 0.4rem 0.6rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+5)) .competitor-name {
  font-size: 0.7rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+5)) .competitor-team {
  font-size: 0.6rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+9)) .matches-container {
  gap: 0.75rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+9)) .match-pair {
  gap: 0.3rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+9)) .competitor-box {
  min-height: 40px;
  padding: 0.35rem 0.5rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+9)) .competitor-name {
  font-size: 0.65rem;
}

.bracket-column:has(.matches-container > .match-group:nth-child(n+9)) .competitor-team {
  font-size: 0.55rem;
}

/* Final */
.final-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 400px;
}

.final-match {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.final-badge {
  background: #333;
  color: white;
  padding: 0.5rem 1.5rem;
  font-weight: bold;
  font-size: 0.95rem;
  border-radius: 6px;
  letter-spacing: 2px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

/* Resultados Abaixo do Chaveamento */
.results-section-bottom {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding: 0 1rem;
}

.results-box {
  border: 3px solid #333;
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.results-header {
  background: #333;
  color: white;
  padding: 0.8rem;
  text-align: center;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 2px;
}

.results-list {
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 2px solid #333;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: white;
}

.result-row:hover {
  background: #f8f9fa;
  border-color: #28a745;
  transform: translateX(3px);
}

.result-pos {
  width: 32px;
  height: 32px;
  background: #28a745;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.95rem;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(40, 167, 69, 0.4);
}

.result-text {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
  flex: 1;
}

/* Scroll personalizado */
.bracket-scroll-container::-webkit-scrollbar {
  width: 10px;
}

.bracket-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.bracket-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.bracket-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.7);
}

/* Responsive */
@media (max-width: 1200px) {
  .bracket-column:not(.final-column) {
    min-width: 200px;
  }
  
  .competitor-name {
    font-size: 0.75rem;
  }
  
  .competitor-team {
    font-size: 0.65rem;
  }
  
  .bracket-scroll-container {
    max-height: calc(100vh - 200px);
  }
}

@media (max-width: 768px) {
  .bracket-title {
    font-size: 1.1rem;
  }

  .bracket-subtitle {
    font-size: 0.85rem;
  }
  
  .bracket-wrapper {
    padding: 1.5rem 1rem;
  }
  
  .bracket-column:not(.final-column) {
    min-width: 180px;
  }
  
  .matches-container {
    gap: 1rem;
  }
  
  .match-pair {
    gap: 0.4rem;
  }
  
  .competitor-box {
    min-height: 50px;
    padding: 0.5rem 0.6rem;
  }
  
  .competitor-name {
    font-size: 0.7rem;
  }
  
  .competitor-team {
    font-size: 0.6rem;
  }
  
  .match-number {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
  
  .bracket-scroll-container {
    max-height: calc(100vh - 180px);
  }
}

@media (max-width: 480px) {
  .bracket-container {
    padding: 0.5rem;
  }
  
  .bracket-title {
    font-size: 0.95rem;
  }

  .bracket-subtitle {
    font-size: 0.75rem;
  }
  
  .bracket-column:not(.final-column) {
    min-width: 160px;
  }
  
  .matches-container {
    gap: 0.75rem;
  }
  
  .match-pair {
    gap: 0.3rem;
  }
  
  .competitor-box {
    min-height: 45px;
    padding: 0.4rem 0.5rem;
  }
  
  .bracket-scroll-container {
    max-height: calc(100vh - 160px);
  }
  
  .results-box {
    max-width: 100%;
  }
}
</style>

