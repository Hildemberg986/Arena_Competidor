<template>
  <div class="campeonato-view">
    <div v-if="loading" class="loading">
      <i class="fa-solid fa-spinner"></i>
      <p>Carregando detalhes do campeonato...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fa-solid fa-circle-exclamation"></i>
      <h3>Erro ao carregar campeonato</h3>
      <p>{{ error }}</p>
      <router-link to="/" class="back-btn">Voltar para bilheteria</router-link>
    </div>

    <div v-else-if="campeonato" class="event-details">
      <router-link to="/" class="back-link">
        <i class="fa-solid fa-arrow-left"></i> Voltar para bilheteria
      </router-link>

      <div class="event-header">
        <img v-if="campeonato.banner_url" :src="campeonato.banner_url" :alt="campeonato.nome_campeonato" class="event-banner">
        <div class="event-info">
          <div :class="`status-badge status-${campeonato.status}`">
            {{ campeonato.status }}
          </div>
          <h1>{{ campeonato.nome_campeonato }}</h1>
          <p class="event-location">
            <i class="fa-solid fa-location-dot"></i>
            {{ campeonato.local }}, {{ campeonato.cidade }} - {{ campeonato.estado }}
          </p>
          <p class="event-date">
            <i class="fa-solid fa-calendar"></i>
            {{ formatDate(campeonato.data_inicio) }} até {{ formatDate(campeonato.data_fim) }}
          </p>
          <p v-if="campeonato.organizador" class="event-organizer">
            <i class="fa-solid fa-user-tie"></i>
            Organização: {{ campeonato.organizador }}
          </p>
        </div>
      </div>

      <div v-if="campeonato.descricao" class="event-description">
        <h2>Descrição</h2>
        <p>{{ campeonato.descricao }}</p>
      </div>

      <div v-if="purchaseNotice" class="purchase-feedback">
        {{ purchaseNotice }}
      </div>

      <div v-if="lotesDisponiveis.length" class="summary-section">
        <div class="section-header">
          <h2>Lotes Disponíveis</h2>
          <p>Valores e disponibilidade atual dos lotes do campeonato.</p>
        </div>

        <div class="lotes-grid">
          <article v-for="lote in lotesDisponiveis" :key="lote.lote_id" class="lote-card">
            <div class="lote-topline">
              <span class="lote-badge">Lote {{ lote.numero_lote }}</span>
              <span class="lote-status">{{ getPrecoCountByLote(lote.lote_id) }} tipo(s)</span>
            </div>
            <h3>{{ lote.nome_lote }}</h3>
            <p class="lote-tipo">{{ getTipoNome(lote.tipo_inscricao_id) }}</p>
            <div class="lote-price-stack">
              <div class="price-stack-label">Preços por inscrição</div>
              <div class="price-chips">
                <span v-for="preco in getPrecosDoLote(lote.lote_id)" :key="preco.id" class="price-chip">
                  {{ getTipoNome(preco.tipo_inscricao_id) }} · {{ formatCurrency(preco.preco) }}
                </span>
                <span v-if="!getPrecosDoLote(lote.lote_id).length" class="price-chip price-chip-empty">
                  Sem preço configurado
                </span>
              </div>
            </div>
            <dl class="lote-stats">
              <div>
                <dt>Disponível</dt>
                <dd>{{ lote.disponivel }}</dd>
              </div>
              <div>
                <dt>Vendidos</dt>
                <dd>{{ lote.quantidade_vendida }}</dd>
              </div>
              <div>
                <dt>Quantidade</dt>
                <dd>{{ lote.quantidade_disponivel }}</dd>
              </div>
            </dl>
            <div class="limit-chip">
              Clique em um tipo abaixo para comprar
            </div>
          </article>
        </div>
      </div>

      <div v-if="tiposInscricao.length" class="summary-section">
        <div class="section-header">
          <h2>Tipos de Inscrição</h2>
          <p>Clique em um tipo para abrir o modal de compra.</p>
        </div>

        <div class="tipos-grid">
          <article
            v-for="tipo in tiposInscricao"
            :key="tipo.id"
            class="tipo-card tipo-card-action"
            role="button"
            tabindex="0"
            @click="selecionarTipo(tipo)"
            @keydown.enter.prevent="selecionarTipo(tipo)"
            @keydown.space.prevent="selecionarTipo(tipo)"
          >
            <div class="tipo-header">
              <h3>{{ tipo.nome_tipo }}</h3>
              <span class="tipo-limit">Até {{ tipo.max_por_pessoa }} por pessoa</span>
            </div>
            <p v-if="tipo.descricao" class="tipo-description">{{ tipo.descricao }}</p>
            <div class="tipo-price-summary">
              <span>A partir de {{ formatCurrency(getMenorPrecoTipo(tipo.id)) }}</span>
              <strong>{{ getQtdLotesTipo(tipo.id) }} lote(s) com preço</strong>
            </div>
            <div class="tipo-meta">
              <span :class="['meta-chip', tipoRequerComprovante(tipo.requer_comprovante)]">
                {{ tipoRequerComprovante(tipo.requer_comprovante) === 'meta-yes' ? 'Requer comprovante' : 'Não requer comprovante' }}
              </span>
              <span class="tipo-action-hint">Clique para comprar</span>
            </div>
          </article>
        </div>
      </div>

      <div v-if="showAuthModal || showPurchaseModal" class="modal-backdrop" @click.self="fecharModais">
        <div v-if="showAuthModal" class="purchase-modal auth-modal">
          <div class="modal-header">
            <div>
              <p class="modal-kicker">Acesso necessário</p>
              <h2>Faça login para continuar</h2>
            </div>
            <button class="modal-close" type="button" @click="fecharModais">×</button>
          </div>

          <p class="modal-text">
            Para comprar uma inscrição, você precisa entrar na sua conta ou criar uma nova.
          </p>

          <div class="modal-actions">
            <button class="btn-secondary" type="button" @click="irParaLogin">
              Fazer login
            </button>
            <button class="btn-primary" type="button" @click="irParaCadastro">
              Criar conta
            </button>
          </div>
        </div>

        <div v-else-if="showPurchaseModal && selectedTipo" class="purchase-modal">
          <div class="modal-header">
            <div>
              <p class="modal-kicker">Compra rápida</p>
              <h2>{{ selectedTipo.nome_tipo }}</h2>
            </div>
            <button class="modal-close" type="button" @click="fecharModais">×</button>
          </div>

          <p class="modal-text" v-if="selectedTipo.descricao">
            {{ selectedTipo.descricao }}
          </p>

          <div class="modal-field" v-if="availableLotsForSelectedType.length > 1">
            <label for="modal-lote">Lote</label>
            <select id="modal-lote" v-model="selectedLoteId">
              <option v-for="lote in availableLotsForSelectedType" :key="lote.lote_id" :value="lote.lote_id">
                Lote {{ lote.numero_lote }} - {{ formatCurrency(getPrecoDoLoteETipo(lote.lote_id, selectedTipo?.id)?.preco) }}
              </option>
            </select>
          </div>

          <div v-if="selectedLot" class="modal-summary">
            <div>
              <span>Lote selecionado</span>
              <strong>{{ selectedLot.nome_lote }}</strong>
            </div>
            <div>
              <span>Limite</span>
              <strong>{{ currentLimit }}</strong>
            </div>
            <div>
              <span>Preço unitário</span>
              <strong>{{ formatCurrency(selectedPreco?.preco) }}</strong>
            </div>
          </div>

          <div class="modal-field">
            <label for="modal-quantidade">Quantidade</label>
            <input
              id="modal-quantidade"
              v-model.number="purchaseQuantity"
              type="number"
              min="1"
              :max="currentLimit"
              inputmode="numeric"
            >
            <p class="modal-help">Selecione de 1 até {{ currentLimit }} unidade(s).</p>
          </div>

          <div class="modal-total">
            <span>Total estimado</span>
            <strong>{{ formatCurrency(modalTotal) }}</strong>
          </div>

          <div v-if="purchaseNotice" class="modal-notice">{{ purchaseNotice }}</div>

          <div class="modal-actions">
            <button class="btn-secondary" type="button" @click="fecharModais">Cancelar</button>
            <button class="btn-primary" type="button" :disabled="!canConfirmPurchase" @click="confirmarCompraLocal">
              Confirmar inscrição
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { eventsService } from '@/services/api'

const route = useRoute()
const router = useRouter()
const campeonato = ref(null)
const loading = ref(true)
const error = ref(null)
const lotesDisponiveis = computed(() => campeonato.value?.lotes_disponiveis ?? [])
const tiposInscricao = ref([])
const precos = ref([])
const tipoSelecionadoId = ref(null)
const loteSelecionadoId = ref(null)
const purchaseQuantity = ref(1)
const showPurchaseModal = ref(false)
const showAuthModal = ref(false)
const purchaseNotice = ref('')

const availableLotsForSelectedType = computed(() => {
  if (!tipoSelecionadoId.value) return []
  return lotesDisponiveis.value.filter(lote => getPrecoDoLoteETipo(lote.lote_id, tipoSelecionadoId.value))
})

const selectedTipo = computed(() => tiposInscricao.value.find(item => item.id === tipoSelecionadoId.value) || null)

const selectedLot = computed(() => {
  if (!availableLotsForSelectedType.value.length) return null
  return availableLotsForSelectedType.value.find(item => item.lote_id === loteSelecionadoId.value) || availableLotsForSelectedType.value[0]
})

const selectedPreco = computed(() => {
  if (!selectedLot.value || !selectedTipo.value) return null
  return getPrecoDoLoteETipo(selectedLot.value.lote_id, selectedTipo.value.id)
})

const currentLimit = computed(() => selectedLot.value && selectedTipo.value ? getLimiteCompra(selectedLot.value, selectedTipo.value.id) : 0)

const modalTotal = computed(() => {
  if (!selectedLot.value || !selectedPreco.value) return 0
  return Math.min(Math.max(Number(purchaseQuantity.value || 1), 1), currentLimit.value) * Number(selectedPreco.value.preco || 0)
})

const canConfirmPurchase = computed(() => Boolean(usuarioAutenticado.value && selectedTipo.value && selectedLot.value && selectedPreco.value && currentLimit.value > 0))

const usuarioAutenticado = computed(() => hasStoredAuthSession())

function formatDate(dateString) {
  if (!dateString) return 'Data não definida'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0))
}

function idsMatch(left, right) {
  return String(left) === String(right)
}

function getPrecoAtivoByLoteETipo(loteId, tipoId) {
  return precos.value.find(item => idsMatch(item.lote_id, loteId) && idsMatch(item.tipo_inscricao_id, tipoId) && String(item.status).toLowerCase() === 'ativo') || null
}

function getPrecoDoLoteETipo(loteId, tipoId) {
  return getPrecoAtivoByLoteETipo(loteId, tipoId)
}

function getPrecosDoLote(loteId) {
  return precos.value
    .filter(item => idsMatch(item.lote_id, loteId) && String(item.status).toLowerCase() === 'ativo')
    .sort((a, b) => Number(a.preco || 0) - Number(b.preco || 0))
}

function getPrecoCountByLote(loteId) {
  return getPrecosDoLote(loteId).length
}

function getMenorPrecoTipo(tipoId) {
  const itens = precos.value.filter(item => idsMatch(item.tipo_inscricao_id, tipoId) && String(item.status).toLowerCase() === 'ativo')
  if (!itens.length) return 0
  return Math.min(...itens.map(item => Number(item.preco || 0)))
}

function getQtdLotesTipo(tipoId) {
  return new Set(precos.value.filter(item => idsMatch(item.tipo_inscricao_id, tipoId) && String(item.status).toLowerCase() === 'ativo').map(item => String(item.lote_id))).size
}

function getTipoNome(tipoInscricaoId) {
  const tipo = tiposInscricao.value.find(item => item.id === tipoInscricaoId)
  return tipo?.nome_tipo || 'Tipo de inscrição'
}

function getTipoPorId(tipoInscricaoId) {
  return tiposInscricao.value.find(item => idsMatch(item.id, tipoInscricaoId)) || null
}

function getLimiteCompra(lote, tipoId) {
  const precoAtivo = getPrecoDoLoteETipo(lote.lote_id, tipoId || lote.tipo_inscricao_id)
  const disponivel = Number(precoAtivo?.quantidade_disponivel ?? lote.disponivel ?? 0)
  const limiteTipo = Number(getTipoPorId(tipoId || lote.tipo_inscricao_id)?.max_por_pessoa || disponivel || 1)
  const quantidadePreco = Number(precoAtivo?.quantidade_disponivel ?? 0)
  return Math.max(0, Math.min(disponivel, limiteTipo, quantidadePreco || disponivel || limiteTipo))
}

function labelStatusLote(status) {
  const normalized = String(status || '').toLowerCase()
  const labels = {
    disponivel: 'Disponível',
    indisponivel: 'Indisponível',
    esgotado: 'Esgotado'
  }
  return labels[normalized] || String(status || 'Indefinido')
}

function tipoRequerComprovante(value) {
  return String(value).toUpperCase() === 'TRUE' ? 'meta-yes' : 'meta-no'
}

function hasStoredAuthSession() {
  if (typeof window === 'undefined') return false

  const authKeys = ['token', 'auth_token', 'access_token', 'user', 'usuario', 'currentUser']
  return authKeys.some(key => {
    const localValue = window.localStorage.getItem(key)
    const sessionValue = window.sessionStorage.getItem(key)
    return Boolean(localValue && localValue !== 'null') || Boolean(sessionValue && sessionValue !== 'null')
  })
}

function getPurchaseKey() {
  return `arena-inscricao-draft-${route.params.id}`
}

function selecionarTipo(tipo) {
  console.log('=== DEBUG SELECIONAR TIPO ===')
  console.log('Tipo clicado:', tipo)
  console.log('Campeonato completo:', campeonato.value)
  console.log('Lotes disponíveis (do campeonato):', campeonato.value?.lotes_disponiveis)
  console.log('Lotes computed:', lotesDisponiveis.value)
  console.log('Preços:', precos.value)
  
  tipoSelecionadoId.value = tipo.id
  purchaseNotice.value = ''

  // Tentar pegar lotes de ambas as fontes
  const lotesDaAPI = campeonato.value?.lotes_disponiveis || []
  const lotesDiretos = campeonato.value?.lotes || []
  const todosLotes = [...lotesDaAPI, ...lotesDiretos]
  
  console.log('Todos os lotes encontrados:', todosLotes)
  
  // Filtrar lotes que têm preço para este tipo
  const lotesDoTipo = todosLotes.filter(lote => {
    const temPreco = getPrecoDoLoteETipo(lote.lote_id, tipo.id)
    console.log(`Lote ${lote.lote_id} tem preço para tipo ${tipo.id}?`, !!temPreco)
    return !!temPreco
  })
  
  console.log('Lotes filtrados para este tipo:', lotesDoTipo)
  
  // Se ainda não encontrou lotes, vamos criar lotes a partir dos preços
  if (!lotesDoTipo.length && precos.value.length > 0) {
    console.log('Criando lotes a partir dos preços...')
    const precosDoTipo = precos.value.filter(p => 
      String(p.tipo_inscricao_id) === String(tipo.id) && 
      String(p.status).toLowerCase() === 'ativo'
    )
    
    console.log('Preços do tipo:', precosDoTipo)
    
    if (precosDoTipo.length > 0) {
      // Verificar se temos lote_id nos preços
      precosDoTipo.forEach(preco => {
        console.log('Preço encontrado:', {
          lote_id: preco.lote_id,
          preco: preco.preco,
          status: preco.status,
          quantidade_disponivel: preco.quantidade_disponivel
        })
      })
      
      // Se o modal não abrir, vamos forçar a abertura
      if (usuarioAutenticado.value) {
        console.log('Forçando abertura do modal de compra (fallback)')
        showPurchaseModal.value = true
        showAuthModal.value = false
        return
      } else {
        console.log('Forçando abertura do modal de login (fallback)')
        showAuthModal.value = true
        showPurchaseModal.value = false
        return
      }
    }
  }
  
  const primeiroLoteComPreco = lotesDoTipo.length > 0 ? lotesDoTipo[0] : null
  
  console.log('Primeiro lote com preço:', primeiroLoteComPreco)
  
  loteSelecionadoId.value = primeiroLoteComPreco?.lote_id ?? null
  purchaseQuantity.value = 1

  if (!lotesDoTipo.length) {
    console.log('Nenhum lote encontrado - mostrando notice')
    purchaseNotice.value = 'Não há lotes disponíveis para este tipo no momento.'
    showPurchaseModal.value = false
    showAuthModal.value = false
    return
  }

  console.log('Usuário autenticado?', usuarioAutenticado.value)
  
  if (usuarioAutenticado.value) {
    showPurchaseModal.value = true
    showAuthModal.value = false
    console.log('Abrindo modal de compra')
  } else {
    showAuthModal.value = true
    showPurchaseModal.value = false
    console.log('Abrindo modal de login')
  }
}

function fecharModais() {
  showPurchaseModal.value = false
  showAuthModal.value = false
}

function irParaLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

function irParaCadastro() {
  router.push({ name: 'cadastro', query: { redirect: route.fullPath } })
}

function confirmarCompraLocal() {
  if (!canConfirmPurchase.value || !selectedTipo.value || !selectedLot.value || !selectedPreco.value) return

  const quantidade = Math.min(Math.max(Number(purchaseQuantity.value || 1), 1), currentLimit.value)
  const draft = {
    campeonatoId: route.params.id,
    campeonatoNome: campeonato.value?.nome_campeonato || '',
    tipoId: selectedTipo.value.id,
    tipoNome: selectedTipo.value.nome_tipo,
    loteId: selectedLot.value.lote_id,
    loteNome: selectedLot.value.nome_lote,
    quantidade,
    precoUnitario: Number(selectedPreco.value.preco || 0),
    total: quantidade * Number(selectedPreco.value.preco || 0),
    atualizadoEm: new Date().toISOString()
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getPurchaseKey(), JSON.stringify(draft))
  }

  purchaseNotice.value = 'Seleção salva localmente neste navegador.'
  purchaseQuantity.value = quantidade
  showPurchaseModal.value = false
}

onMounted(async () => {
  try {
    const [resumoResult, tiposResult, precosResult] = await Promise.allSettled([
      eventsService.getEventById(route.params.id),
      eventsService.getTiposInscricaoByCampeonatoId(route.params.id),
      eventsService.getPrecosByCampeonatoId(route.params.id)
    ])

    if (resumoResult.status === 'fulfilled' && resumoResult.value.status === 'success' && resumoResult.value.data) {
      campeonato.value = resumoResult.value.data
    } else {
      throw new Error('Campeonato não encontrado')
    }

    if (tiposResult.status === 'fulfilled' && tiposResult.value.status === 'success' && Array.isArray(tiposResult.value.data)) {
      tiposInscricao.value = tiposResult.value.data
    } else {
      tiposInscricao.value = []
    }

    if (precosResult && precosResult.status === 'fulfilled' && precosResult.value.status === 'success' && Array.isArray(precosResult.value.data)) {
      precos.value = precosResult.value.data
    } else {
      precos.value = []
    }

    purchaseNotice.value = ''
  } catch (err) {
    error.value = err.message || 'Erro ao carregar campeonato'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.campeonato-view {
  max-width: 1120px;
  margin: 0 auto;
}

.loading, .error-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading i {
  font-size: 2.5rem;
  color: var(--primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.back-link, .back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: var(--transition);
}

.back-link:hover, .back-btn:hover {
  color: #c81e14;
}

.event-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.event-banner {
  width: 100%;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.status-ativo {
  background: #10b981;
  color: white;
}

.status-planejado {
  background: #3b82f6;
  color: white;
}

.status-concluido {
  background: #64748b;
  color: white;
}

.status-cancelado {
  background: #ef4444;
  color: white;
}

.event-info h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.event-location, .event-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.event-location i, .event-date i, .event-organizer i {
  color: var(--primary);
}

.event-organizer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.event-description {
  background: var(--card);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 2rem;
}

.event-description h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.purchase-feedback {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 14px;
  padding: 0.9rem 1rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.summary-section {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  margin-bottom: 0.35rem;
}

.section-header p {
  color: var(--text-light);
}

.lotes-grid,
.tipos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.lote-card,
.tipo-card {
  background: var(--card);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 1.25rem;
}

.lote-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  min-height: 100%;
}

.lote-topline,
.tipo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.lote-topline {
  align-items: center;
}

.lote-badge,
.lote-status,
.meta-chip,
.tipo-limit,
.limit-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
}

.lote-badge {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.lote-status {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.limit-chip {
  width: fit-content;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
}

.status-disponivel {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.status-indisponivel,
.status-esgotado {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.lote-card h3,
.tipo-card h3 {
  margin: 0.85rem 0 0.4rem;
  font-size: 1.15rem;
}

.lote-tipo,
.tipo-description {
  color: var(--text-light);
  margin-bottom: 0;
}

.lote-price {
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 1rem;
}

.lote-price-stack {
  background: rgba(148, 163, 184, 0.08);
  border-radius: 14px;
  padding: 0.85rem;
}

.price-stack-label,
.tipo-price-summary span {
  display: block;
  font-size: 0.78rem;
  color: var(--text-light);
  margin-bottom: 0.45rem;
  font-weight: 700;
}

.price-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.price-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.45rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: var(--text);
}

.price-chip-empty {
  color: var(--text-light);
  background: rgba(148, 163, 184, 0.08);
}

.lote-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.lote-stats div {
  background: rgba(148, 163, 184, 0.08);
  border-radius: 12px;
  padding: 0.75rem;
}

.lote-stats dt {
  font-size: 0.78rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.lote-stats dd {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
}

.compra-box {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  padding: 0.95rem;
}

.compra-box label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.55rem;
}

.compra-controls {
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 0.75rem;
  align-items: center;
}

.compra-controls input {
  width: 100%;
  height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 0.75rem;
  font: inherit;
  background: white;
  color: var(--text);
}

.compra-controls input:disabled,
.btn-comprar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.compra-helper {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-light);
}

.btn-comprar {
  width: 100%;
  height: 44px;
  padding: 0 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
}

.btn-comprar:hover:not(:disabled) {
  background: #c81e14;
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(230, 33, 23, 0.18);
}

.btn-comprar:active:not(:disabled) {
  transform: translateY(0);
}

.btn-comprar:disabled {
  background: #94a3b8;
}

.tipo-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tipo-card-action {
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid transparent;
}

.tipo-card-action:hover,
.tipo-card-action:focus-visible {
  transform: translateY(-3px);
  border-color: rgba(230, 33, 23, 0.18);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.12);
  outline: none;
}

.tipo-limit {
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  white-space: nowrap;
}

.tipo-meta {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-chip {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.meta-yes {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.meta-no {
  background: rgba(100, 116, 139, 0.12);
  color: #475569;
}

.tipo-action-hint {
  display: inline-flex;
  align-items: center;
  color: var(--primary);
  font-size: 0.82rem;
  font-weight: 700;
}

.tipo-price-summary {
  background: rgba(148, 163, 184, 0.08);
  border-radius: 14px;
  padding: 0.85rem;
}

.tipo-price-summary strong {
  display: block;
  color: var(--text);
  font-size: 0.95rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.purchase-modal {
  width: min(100%, 560px);
  background: var(--card);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.25);
}

.auth-modal {
  width: min(100%, 480px);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.modal-kicker {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 0.25rem;
}

.modal-header h2 {
  font-size: 1.5rem;
}

.modal-close {
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--text);
  font-size: 1.35rem;
  cursor: pointer;
}

.modal-text {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.modal-field {
  margin-bottom: 1rem;
}

.modal-field label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.45rem;
}

.modal-field input,
.modal-field select {
  width: 100%;
  min-height: 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 0.8rem;
  font: inherit;
  background: white;
  color: var(--text);
}

.modal-help {
  margin-top: 0.45rem;
  font-size: 0.8rem;
  color: var(--text-light);
}

.modal-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modal-summary div,
.modal-total {
  background: rgba(148, 163, 184, 0.08);
  border-radius: 14px;
  padding: 0.85rem;
}

.modal-summary span,
.modal-total span {
  display: block;
  font-size: 0.76rem;
  color: var(--text-light);
  margin-bottom: 0.2rem;
}

.modal-summary strong,
.modal-total strong {
  font-size: 1rem;
}

.modal-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.purchase-modal h2,
.purchase-modal .modal-text,
.auth-modal h2 {
  word-break: break-word;
}

.modal-notice {
  margin-bottom: 1rem;
  color: #065f46;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  min-height: 46px;
  padding: 0 1rem;
  border: none;
  border-radius: 12px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #c81e14;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.12);
  color: #334155;
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.2);
}

@media (max-width: 768px) {
  .event-header {
    grid-template-columns: 1fr;
  }

  .lote-stats {
    grid-template-columns: 1fr;
  }

  .lote-topline,
  .tipo-header {
    flex-direction: column;
  }

  .compra-controls {
    grid-template-columns: 1fr;
  }

  .modal-summary {
    grid-template-columns: 1fr;
  }

  .modal-actions,
  .modal-total {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
