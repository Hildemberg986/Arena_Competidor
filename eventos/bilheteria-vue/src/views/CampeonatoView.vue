<template>
  <div class="campeonato-view">
    <div v-if="loading" class="loading">
      <i class="fa-solid fa-spinner"></i>
      <p>Carregando Detalhes do Evento...</p>
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
        <img
          v-if="campeonato.banner_url"
          :src="campeonato.banner_url"
          :alt="campeonato.nome_campeonato"
          class="event-banner"
        />
        <div class="event-info">
          <div :class="`status-badge status-${campeonato.status}`">
            {{ formatarStatusCampeonato(campeonato.status) }}
          </div>
          <h1>{{ campeonato.nome_campeonato }}</h1>
          <p class="event-location">
            <i class="fa-solid fa-location-dot"></i>
            {{ campeonato.local }}, {{ campeonato.cidade }} -
            {{ campeonato.estado }}
          </p>
          <p class="event-date">
            <i class="fa-solid fa-calendar"></i>
            {{ formatDate(campeonato.data_inicio) }} até
            {{ formatDate(campeonato.data_fim) }}
          </p>
          <p v-if="campeonato.organizador" class="event-organizer">
            <i class="fa-solid fa-user-tie"></i>
            Organização: {{ campeonato.organizador }}
          </p>

          <div v-if="isCampeonatoEncerrado" class="campeonato-aviso">
            <i class="fa-solid fa-circle-info"></i>
            {{ avisoCampeonato }}
          </div>
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
          <h2>Lotes e Tipos Disponíveis</h2>
          <p>
            {{
              isCampeonatoEncerrado
                ? "Visualização dos lotes"
                : "Cada tipo de inscrição com sua disponibilidade individual."
            }}
          </p>
        </div>

        <div
          :class="[
            'lotes-grid',
            lotesDisponiveis.length === 1
              ? 'lotes-grid--few'
              : lotesDisponiveis.length === 2
                ? 'lotes-grid--some'
                : 'lotes-grid--many',
          ]"
        >
          <article
            v-for="lote in lotesDisponiveis"
            :key="`${lote.lote_id}-${lote.tipo_inscricao_id}`"
            :class="[
              'lote-card',
              {
                'lote-card--esgotado': lote.status === 'esgotado',
                'lote-card--encerrado': lote.status === 'encerrado',
                'lote-card--cancelado': lote.status === 'cancelado',
              },
            ]"
            :tabindex="isLoteClicavel(lote) ? 0 : -1"
            @click="isLoteClicavel(lote) && selecionarTipoPorLote(lote)"
            @keydown.enter.prevent="
              isLoteClicavel(lote) && selecionarTipoPorLote(lote)
            "
            @keydown.space.prevent="
              isLoteClicavel(lote) && selecionarTipoPorLote(lote)
            "
          >
            <div
              v-if="lote.status !== 'ativo'"
              :class="`status-overlay overlay-${lote.status}`"
            >
              <i :class="`fa-solid ${iconeStatusLote(lote.status)}`"></i>
              <span>{{ formatarStatus(lote.status).toUpperCase() }}</span>
            </div>

            <div class="lote-topline">
              <span class="lote-badge">
                Lote {{ formatarNumeroLote(lote.numero_lote || lote.lote_id) }}
              </span>
              <span :class="['lote-status-badge', `status-${lote.status}`]">
                {{ formatarStatus(lote.status) }}
              </span>
            </div>

            <h3>{{ lote.nome_lote }}</h3>

            <div class="lote-datas">
              <div class="data-item">
                <i class="fa-solid fa-calendar-check"></i>
                <div>
                  <span class="data-label">Início vendas</span>
                  <span class="data-value">{{
                    formatDate(lote.data_inicio_vendas)
                  }}</span>
                </div>
              </div>
              <div class="data-item">
                <i class="fa-solid fa-calendar-xmark"></i>
                <div>
                  <span class="data-label">Fim vendas</span>
                  <span class="data-value">{{
                    formatDate(lote.data_fim_vendas)
                  }}</span>
                </div>
              </div>
            </div>

            <div class="lote-price-stack">
              <div class="price-stack-label">Preço por inscrição</div>
              <div class="price-chips">
                <span class="price-chip">
                  {{ lote.nome_tipo }} · {{ formatCurrency(lote.preco) }}
                </span>
              </div>
            </div>

            <dl class="lote-stats">
              <div>
                <dt>Disponível</dt>
                <dd>{{ lote.quantidade_disponivel || 0 }}</dd>
              </div>
              <div>
                <dt>Vendidos</dt>
                <dd>{{ lote.quantidade_vendida || 0 }}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>
                  {{
                    (lote.quantidade_disponivel || 0) +
                    (lote.quantidade_vendida || 0)
                  }}
                </dd>
              </div>
            </dl>

            <div class="tipo-meta">
              <span
                :class="[
                  'meta-chip',
                  tipoRequerComprovante(lote.requer_comprovante),
                ]"
              >
                {{
                  tipoRequerComprovante(lote.requer_comprovante) === "meta-yes"
                    ? "Requer comprovante"
                    : "Não requer comprovante"
                }}
              </span>
              <span v-if="isLoteClicavel(lote)" class="tipo-action-hint">
                Clique para comprar
              </span>
              <span v-else class="tipo-action-hint status-indisponivel">
                {{ mensagemIndisponivel(lote.status) }}
              </span>
            </div>
          </article>
        </div>
      </div>

      <div v-else-if="!loading && campeonato" class="empty-state">
        <i class="fa-solid fa-ticket"></i>
        <h3>Nenhum lote disponível</h3>
        <p>
          {{
            isCampeonatoEncerrado
              ? "Este evento foi encerrado."
              : "Não há lotes disponíveis para este evento no momento."
          }}
        </p>
      </div>

      <!-- Modal de autenticação -->
      <div
        v-if="showAuthModal || showPurchaseModal"
        class="modal-backdrop"
        @click.self="fecharModais"
      >
        <div v-if="showAuthModal" class="purchase-modal auth-modal">
          <div class="modal-header">
            <div>
              <p class="modal-kicker">Acesso necessário</p>
              <h2>Faça login para continuar</h2>
            </div>
            <button class="modal-close" type="button" @click="fecharModais">
              ×
            </button>
          </div>
          <p class="modal-text">
            Para comprar uma inscrição, você precisa entrar na sua conta ou
            criar uma nova.
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

        <!-- Modal de compra -->
        <div
          v-else-if="showPurchaseModal && selectedTipo"
          class="purchase-modal"
        >
          <div class="modal-header">
            <div>
              <p class="modal-kicker">Compra rápida</p>
              <h2>{{ selectedTipo.nome_tipo }}</h2>
              <p class="modal-subtitle">
                Lote
                {{
                  formatarNumeroLote(
                    selectedTipo.numero_lote || selectedTipo.lote_id,
                  )
                }}
                - {{ selectedTipo.nome_lote }}
              </p>
            </div>
            <button class="modal-close" type="button" @click="fecharModais">
              ×
            </button>
          </div>

          <p class="modal-text" v-if="selectedTipo.descricao">
            {{ selectedTipo.descricao }}
          </p>

          <div class="modal-summary">
            <div>
              <span>Lote</span>
              <strong>{{ selectedTipo.nome_lote }}</strong>
            </div>
            <div>
              <span>Disponível</span>
              <strong>{{ currentLimit }}</strong>
            </div>
            <div>
              <span>Preço unitário</span>
              <strong>{{ formatCurrency(selectedTipo.preco) }}</strong>
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
              :step="1"
              :disabled="currentLimit <= 1"
              inputmode="numeric"
              @input="normalizarQuantidade"
            />
            <p class="modal-help">
              Selecione de 1 até {{ currentLimit }} unidade(s).
            </p>
          </div>

          <div class="modal-total">
            <span>Total estimado</span>
            <strong>{{ formatCurrency(modalTotal) }}</strong>
          </div>

          <div v-if="purchaseNotice" class="modal-notice">
            {{ purchaseNotice }}
          </div>

          <div class="modal-actions">
            <button class="btn-secondary" type="button" @click="fecharModais">
              Cancelar
            </button>
            <button
              class="btn-primary"
              type="button"
              :disabled="!canConfirmPurchase || purchaseLoading"
              @click="confirmarCompraLocal"
            >
              {{ purchaseLoading ? "Confirmando..." : "Confirmar inscrição" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { eventsService, ticketsService } from "@/services/api";

const route = useRoute();
const router = useRouter();
const campeonato = ref(null);
const loading = ref(true);
const error = ref(null);
const precos = ref([]);
const tiposInscricao = ref([]);
const selectedLote = ref(null);
const purchaseQuantity = ref(1);
const showPurchaseModal = ref(false);
const showAuthModal = ref(false);
const purchaseNotice = ref("");
const purchaseLoading = ref(false);

// ========== FORMATADORES ==========
function formatarNumeroLote(numero) {
  if (!numero) return "0001";
  const num = Number(numero);
  return String(num).padStart(4, "0");
}

function formatDate(dateString) {
  if (!dateString) return "Data não definida";

  // Converte a string para Date
  const date = new Date(dateString);

  // Ajusta para o fuso horário local corretamente
  // Adiciona o offset do timezone para compensar
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() + offset * 60 * 1000);

  return adjustedDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC", // Força usar UTC para evitar conversão
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatarStatusCampeonato(status) {
  const map = {
    planejado: "Planejado",
    ativo: "Ativo",
    finalizado: "Finalizado",
    cancelado: "Cancelado",
  };
  return map[status] || status;
}

function formatarStatus(status) {
  const map = {
    ativo: "Ativo",
    esgotado: "Esgotado",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
    inativo: "Inativo",
  };
  return map[status] || status;
}

function iconeStatusLote(status) {
  const map = {
    esgotado: "fa-circle-xmark",
    encerrado: "fa-lock",
    cancelado: "fa-ban",
  };
  return map[status] || "fa-circle-xmark";
}

function tipoRequerComprovante(value) {
  return String(value).toUpperCase() === "TRUE" ? "meta-yes" : "meta-no";
}

// ========== COMPUTED ==========
const isCampeonatoEncerrado = computed(() => {
  if (!campeonato.value) return false;
  return (
    campeonato.value.status === "finalizado" ||
    campeonato.value.status === "cancelado"
  );
});

const avisoCampeonato = computed(() => {
  if (campeonato.value?.status === "finalizado")
    return "Este campeonato foi finalizado. Nenhuma compra pode ser realizada.";
  if (campeonato.value?.status === "cancelado")
    return "Este campeonato foi cancelado.";
  return "";
});

const lotesAgrupados = computed(() => {
  const grupos = new Map();
  precos.value.forEach((preco) => {
    if (preco.status === "inativo") return;
    const key = `${preco.lote_id}-${preco.tipo_inscricao_id}`;
    if (!grupos.has(key)) {
      grupos.set(key, {
        lote_id: preco.lote_id,
        tipo_inscricao_id: preco.tipo_inscricao_id,
        nome_lote: preco.nome_lote || `Lote ${preco.lote_id}`,
        nome_tipo: preco.nome_tipo || "Tipo não definido",
        numero_lote: preco.numero_lote || preco.lote_id,
        quantidade_disponivel: preco.quantidade_disponivel || 0,
        quantidade_vendida: preco.quantidade_vendida || 0,
        preco: preco.preco,
        status: preco.status,
        requer_comprovante: preco.requer_comprovante || false,
        descricao: preco.descricao || "",
        data_inicio_vendas: preco.data_inicio_vendas || null,
        data_fim_vendas: preco.data_fim_vendas || null,
      });
    }
  });
  return Array.from(grupos.values());
});

const lotesDisponiveis = computed(() => lotesAgrupados.value);
const selectedTipo = computed(() => selectedLote.value || null);

const currentLimit = computed(() => {
  if (!selectedTipo.value) return 0;
  return Number(selectedTipo.value.quantidade_disponivel || 0);
});

const normalizedPurchaseQuantity = computed(() => {
  if (!currentLimit.value) return 0;
  return Math.min(
    Math.max(Number(purchaseQuantity.value || 1), 1),
    currentLimit.value,
  );
});

const modalTotal = computed(() => {
  if (!selectedTipo.value) return 0;
  return (
    normalizedPurchaseQuantity.value * Number(selectedTipo.value.preco || 0)
  );
});

const canConfirmPurchase = computed(() => {
  return Boolean(
    usuarioAutenticado.value &&
    selectedTipo.value &&
    currentLimit.value > 0 &&
    normalizedPurchaseQuantity.value > 0 &&
    selectedTipo.value.status === "ativo" &&
    !isCampeonatoEncerrado.value,
  );
});

const usuarioAutenticado = computed(() => hasStoredAuthSession());

// ========== FUNÇÕES ==========
function isLoteClicavel(lote) {
  return lote.status === "ativo" && !isCampeonatoEncerrado.value;
}

function mensagemIndisponivel(status) {
  const map = {
    esgotado: "Esgotado",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };
  return map[status] || "Indisponível";
}

function hasStoredAuthSession() {
  if (typeof window === "undefined") return false;
  const authKeys = [
    "token",
    "auth_token",
    "access_token",
    "user",
    "usuario",
    "currentUser",
  ];
  return authKeys.some((key) => {
    const localValue = window.localStorage.getItem(key);
    const sessionValue = window.sessionStorage.getItem(key);
    return (
      Boolean(localValue && localValue !== "null") ||
      Boolean(sessionValue && sessionValue !== "null")
    );
  });
}

function selecionarTipoPorLote(lote) {
  if (!isLoteClicavel(lote)) return;
  selectedLote.value = lote;
  purchaseNotice.value = "";
  purchaseQuantity.value = 1;
  if (usuarioAutenticado.value) {
    showPurchaseModal.value = true;
    showAuthModal.value = false;
  } else {
    showAuthModal.value = true;
    showPurchaseModal.value = false;
  }
}

function fecharModais() {
  showPurchaseModal.value = false;
  showAuthModal.value = false;
  purchaseLoading.value = false;
  selectedLote.value = null;
}

function irParaLogin() {
  router.push({ name: "login", query: { redirect: route.fullPath } });
}

function irParaCadastro() {
  router.push({ name: "cadastro", query: { redirect: route.fullPath } });
}

function normalizarQuantidade() {
  if (!currentLimit.value) {
    purchaseQuantity.value = 1;
    return;
  }
  purchaseQuantity.value = Math.min(
    Math.max(Number(purchaseQuantity.value || 1), 1),
    currentLimit.value,
  );
}

watch(currentLimit, (limit) => {
  if (limit > 0)
    purchaseQuantity.value = Math.min(
      Math.max(Number(purchaseQuantity.value || 1), 1),
      limit,
    );
});

// ========== COMPRA ==========
async function confirmarCompraLocal() {
  if (!canConfirmPurchase.value) return;
  purchaseLoading.value = true;
  purchaseNotice.value = "";

  try {
    const quantidade = normalizedPurchaseQuantity.value;
    const payload = {
      campeonato_id: Number(route.params.id),
      lote_id: Number(selectedTipo.value.lote_id),
      tipo_inscricao_id: Number(selectedTipo.value.tipo_inscricao_id),
      quantidade,
    };

    const response = await ticketsService.createTicket(payload);
    const data = response?.data || response;
    const paymentUrl = data?.payment_url;

    if (paymentUrl) {
      fecharModais();
      await new Promise((resolve) => setTimeout(resolve, 300));
      window.open(paymentUrl, "_blank");
      purchaseNotice.value = "Pagamento aberto em nova aba!";
      setTimeout(async () => {
        purchaseNotice.value = "";
        await recarregarDados();
      }, 5000);
    } else {
      throw new Error("Link de pagamento não recebido");
    }
  } catch (err) {
    const mensagem =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err.message ||
      "Falha ao processar inscrição.";
    purchaseNotice.value = mensagem;
    if (err?.response?.status === 401) {
      setTimeout(
        () =>
          router.push({ name: "login", query: { redirect: route.fullPath } }),
        2000,
      );
    }
  } finally {
    purchaseLoading.value = false;
  }
}

async function recarregarDados() {
  try {
    const [resumoResult, precosResult] = await Promise.allSettled([
      eventsService.getEventById(route.params.id),
      eventsService.getPrecosByCampeonatoId(route.params.id),
    ]);
    if (
      resumoResult.status === "fulfilled" &&
      resumoResult.value?.status === "success" &&
      resumoResult.value.data
    ) {
      campeonato.value = resumoResult.value.data;
    }
    if (
      precosResult.status === "fulfilled" &&
      precosResult.value?.status === "success" &&
      Array.isArray(precosResult.value.data)
    ) {
      precos.value = precosResult.value.data;
    }
  } catch (err) {
    console.error("Erro ao recarregar dados:", err);
  }
}

// ========== MOUNT ==========
onMounted(async () => {
  try {
    const [resumoResult, tiposResult, precosResult] = await Promise.allSettled([
      eventsService.getEventById(route.params.id),
      eventsService.getTiposInscricaoByCampeonatoId(route.params.id),
      eventsService.getPrecosByCampeonatoId(route.params.id),
    ]);

    if (
      resumoResult.status === "fulfilled" &&
      resumoResult.value.status === "success" &&
      resumoResult.value.data
    ) {
      campeonato.value = resumoResult.value.data;
    } else {
      throw new Error("Campeonato não encontrado");
    }

    tiposInscricao.value =
      tiposResult.status === "fulfilled" && tiposResult.value?.data
        ? tiposResult.value.data
        : [];
    precos.value =
      precosResult.status === "fulfilled" && precosResult.value?.data
        ? precosResult.value.data
        : [];
  } catch (err) {
    error.value = err.message || "Erro ao carregar campeonato";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* ============================================ */
/* GERAL */
/* ============================================ */
.campeonato-view {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  box-sizing: border-box;
}

.loading,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}
.loading i {
  font-size: 2.5rem;
  color: var(--primary);
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.error-state i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}
.empty-state i {
  font-size: 3rem;
  color: var(--text-light);
  opacity: 0.3;
  margin-bottom: 1rem;
}
.empty-state h3 {
  margin-bottom: 0.5rem;
}

.back-link,
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 1.5rem;
  transition: all 0.2s;
}
.back-link:active,
.back-btn:active {
  color: #c81e14;
}

/* ============================================ */
/* EVENT HEADER */
/* ============================================ */
.event-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.event-banner {
  width: 100%;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}
.status-ativo {
  background: #10b981;
  color: white;
}
.status-planejado {
  background: #3b82f6;
  color: white;
}
.status-finalizado {
  background: #64748b;
  color: white;
}
.status-cancelado {
  background: #ef4444;
  color: white;
}

.event-info h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}
.event-location,
.event-date,
.event-organizer {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-light);
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
}
.event-location i,
.event-date i,
.event-organizer i {
  color: var(--primary);
  font-size: 0.85rem;
}

.campeonato-aviso {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef3c7;
  color: #92400e;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  margin-top: 0.75rem;
  font-weight: 600;
  font-size: 0.8rem;
}

/* ============================================ */
/* DESCRIPTION */
/* ============================================ */
.event-description {
  background: var(--card);
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 1.5rem;
}
.event-description h2 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}
.event-description p {
  font-size: 0.9rem;
}

/* ============================================ */
/* FEEDBACK */
/* ============================================ */
.purchase-feedback {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  margin-bottom: 1.25rem;
  font-weight: 600;
  font-size: 0.9rem;
}

/* ============================================ */
/* SUMMARY */
/* ============================================ */
.summary-section {
  margin-bottom: 1.5rem;
}
.section-header {
  margin-bottom: 1rem;
}
.section-header h2 {
  font-size: 1.3rem;
  margin-bottom: 0.25rem;
}
.section-header p {
  color: var(--text-light);
  font-size: 0.85rem;
}

/* ============================================ */
/* LOTES GRID */
/* ============================================ */
.lotes-grid {
  display: grid;
  gap: 1rem;
}
.lotes-grid--few {
  grid-template-columns: minmax(280px, 380px);
  justify-content: center;
}
.lotes-grid--some {
  grid-template-columns: repeat(2, 1fr);
}
.lotes-grid--many {
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.lote-card {
  position: relative;
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}
.lote-card:active:not(.lote-card--esgotado):not(.lote-card--encerrado):not(
    .lote-card--cancelado
  ) {
  transform: translateY(-2px);
  border-color: rgba(230, 33, 23, 0.2);
}
.lote-card--esgotado,
.lote-card--encerrado,
.lote-card--cancelado {
  opacity: 0.65;
  cursor: not-allowed;
  filter: grayscale(0.4);
}

.status-overlay {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  letter-spacing: 0.5px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.overlay-esgotado {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}
.overlay-encerrado {
  background: rgba(100, 116, 139, 0.9);
  color: white;
}
.overlay-cancelado {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.lote-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.lote-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
}
.lote-status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-ativo {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}
.status-esgotado {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}
.status-encerrado {
  background: rgba(100, 116, 139, 0.12);
  color: #475569;
}
.status-cancelado {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.lote-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.lote-datas {
  background: rgba(148, 163, 184, 0.05);
  border-radius: 12px;
  padding: 0.65rem;
  display: flex;
  gap: 0.75rem;
}
.data-item {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
}
.data-item i {
  color: var(--primary);
  font-size: 0.8rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}
.data-label {
  display: block;
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.data-value {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
}

.lote-price-stack {
  background: rgba(148, 163, 184, 0.06);
  border-radius: 12px;
  padding: 0.65rem;
}
.price-stack-label {
  font-size: 0.7rem;
  color: var(--text-light);
  margin-bottom: 0.3rem;
  font-weight: 700;
}
.price-chip {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 700;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.lote-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.lote-stats div {
  background: rgba(148, 163, 184, 0.05);
  border-radius: 12px;
  padding: 0.6rem;
  text-align: center;
}
.lote-stats dt {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.lote-stats dd {
  font-size: 1rem;
  font-weight: 800;
  margin: 0.15rem 0 0;
}

.tipo-meta {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.meta-chip {
  display: inline-flex;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  width: fit-content;
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
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
}
.status-indisponivel {
  color: #94a3b8;
}

/* ============================================ */
/* MODAL */
/* ============================================ */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.25s;
}
.purchase-modal {
  background: var(--card);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2);
  padding: 1.25rem;
  animation: slideUp 0.3s;
}
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.modal-kicker {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--primary);
}
.modal-header h2 {
  font-size: 1.2rem;
  margin: 0.15rem 0;
}
.modal-subtitle {
  color: var(--text-light);
  font-size: 0.8rem;
}
.modal-close {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: var(--text);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.modal-close:active {
  background: #e2e8f0;
}
.modal-text {
  color: var(--text-light);
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.modal-field {
  margin-bottom: 0.75rem;
}
.modal-field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-light);
  margin-bottom: 0.35rem;
}
.modal-field input {
  width: 100%;
  min-height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 0.75rem;
  font: inherit;
  font-size: 0.9rem;
  background: #fff;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}
.modal-field input:focus {
  outline: none;
  border-color: var(--primary);
}
.modal-help {
  margin-top: 0.3rem;
  font-size: 0.75rem;
  color: var(--text-light);
}

.modal-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.modal-summary div {
  background: rgba(148, 163, 184, 0.06);
  border-radius: 10px;
  padding: 0.6rem;
  text-align: center;
}
.modal-summary span {
  font-size: 0.7rem;
  color: var(--text-light);
}
.modal-summary strong {
  font-size: 0.9rem;
}

.modal-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(148, 163, 184, 0.06);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  margin-bottom: 0.75rem;
}
.modal-total span {
  font-size: 0.85rem;
  color: var(--text-light);
}
.modal-total strong {
  font-size: 1.1rem;
  color: var(--primary);
}

.modal-notice {
  margin-bottom: 0.75rem;
  color: #065f46;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.modal-actions button {
  flex: 1;
}
.btn-primary,
.btn-secondary {
  min-height: 44px;
  padding: 0 1rem;
  border: none;
  border-radius: 12px;
  font: inherit;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.btn-primary {
  background: var(--primary);
  color: white;
}
.btn-primary:active {
  background: #c81e14;
}
.btn-primary:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
.btn-secondary {
  background: rgba(148, 163, 184, 0.12);
  color: #334155;
}
.btn-secondary:active {
  background: rgba(148, 163, 184, 0.2);
}

/* ============================================ */
/* MOBILE */
/* ============================================ */
@media (max-width: 768px) {
  .campeonato-view {
    padding: 0 0.75rem;
  }
  .event-header {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .event-info h1 {
    font-size: 1.3rem;
  }
  .lotes-grid {
    grid-template-columns: 1fr !important;
  }
  .lotes-grid--few {
    grid-template-columns: 1fr !important;
  }
  .lote-datas {
    flex-direction: column;
    gap: 0.4rem;
  }
  .modal-summary {
    grid-template-columns: 1fr;
  }
  .modal-actions {
    flex-direction: column-reverse;
  }
  .purchase-modal {
    border-radius: 20px 20px 0 0;
  }
}

@media (max-width: 480px) {
  .lote-card {
    padding: 1rem;
  }
  .lote-card h3 {
    font-size: 0.95rem;
  }
  .lote-stats {
    gap: 0.35rem;
  }
  .lote-stats div {
    padding: 0.5rem;
  }
}

/* ============================================ */
/* TABLET+ */
/* ============================================ */
@media (min-width: 769px) {
  .event-info h1 {
    font-size: 2rem;
  }
  .purchase-modal {
    border-radius: 20px;
    margin: auto;
  }
  .modal-actions button {
    flex: 0;
  }
  .btn-primary,
  .btn-secondary {
    padding: 0 1.5rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
