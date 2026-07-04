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
    const adjustedDate = new Date(date.getTime() + (offset * 60 * 1000));
    
    return adjustedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC"  // Força usar UTC para evitar conversão
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
  .campeonato-view {
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .loading,
  .error-state {
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

  .back-link,
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    margin-bottom: 2rem;
    transition: var(--transition);
  }

  .back-link:hover,
  .back-btn:hover {
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

  .event-location,
  .event-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }

  .event-location i,
  .event-date i,
  .event-organizer i {
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
    margin-bottom: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
    margin-bottom: 0.35rem;
  }

  .section-header p {
    color: var(--text-light);
  }

  .lotes-grid {
    display: grid;
    gap: 1.5rem;
  }

  /* 1 card: centralizado no meio com largura fixa */
  .lotes-grid--few {
    grid-template-columns: 380px;
    justify-content: center;
  }

  /* 2 cards: grid de 2 colunas */
  .lotes-grid--some {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 3+ cards: grid automático */
  .lotes-grid--many {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .lote-card {
    position: relative;
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    overflow: hidden;
    height: 100%;
    min-height: 420px;
  }

  .lote-card:hover:not(.lote-card--esgotado) {
    transform: translateY(-4px);
    border-color: rgba(230, 33, 23, 0.2);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
  }

  .lote-card--esgotado {
    opacity: 0.7;
    cursor: not-allowed;
    filter: grayscale(0.3);
  }

  .esgotado-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(239, 68, 68, 0.95);
    color: white;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    letter-spacing: 0.5px;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  .esgotado-overlay i {
    font-size: 0.85rem;
  }

  .lote-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .lote-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.12),
      rgba(37, 99, 235, 0.08)
    );
    color: #1d4ed8;
  }

  .lote-status-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.3rem 0.7rem;
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

  .lote-card h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text);
    min-height: 3rem;
  }

  /* Estilos das datas */
  .lote-datas {
    background: linear-gradient(
      135deg,
      rgba(148, 163, 184, 0.06),
      rgba(148, 163, 184, 0.03)
    );
    border-radius: 14px;
    padding: 0.85rem;
    display: flex;
    gap: 1rem;
    min-height: 72px;
  }

  .data-item {
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .data-item i {
    color: var(--primary);
    font-size: 0.9rem;
    margin-top: 0.15rem;
    flex-shrink: 0;
  }

  .data-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.15rem;
  }

  .data-value {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text);
  }

  .lote-price-stack {
    background: linear-gradient(
      135deg,
      rgba(148, 163, 184, 0.08),
      rgba(148, 163, 184, 0.04)
    );
    border-radius: 14px;
    padding: 0.85rem;
    min-height: 72px;
  }

  .price-stack-label {
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
    font-size: 0.85rem;
    font-weight: 700;
    background: white;
    border: 1px solid rgba(148, 163, 184, 0.22);
    color: var(--text);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .lote-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    min-height: 85px;
  }

  .lote-stats div {
    background: rgba(148, 163, 184, 0.06);
    border-radius: 14px;
    padding: 0.85rem;
    text-align: center;
    transition: background 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .lote-stats div:hover {
    background: rgba(148, 163, 184, 0.1);
  }

  .lote-stats dt {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-light);
    margin-bottom: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .lote-stats dd {
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0;
    color: var(--text);
  }

  .tipo-meta {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 65px;
  }

  .meta-chip {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
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
    display: inline-flex;
    align-items: center;
    color: var(--primary);
    font-size: 0.82rem;
    font-weight: 700;
  }

  .esgotado-text {
    color: #94a3b8;
  }

  /* Modal styles mantidos iguais */
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
    padding: 1.5rem;
    box-shadow: 0 24px 50px rgba(15, 23, 42, 0.25);
    max-height: 90vh;
    overflow-y: auto;
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
    margin: 0;
  }

  .modal-subtitle {
    color: var(--text-light);
    font-size: 0.9rem;
    margin: 0.25rem 0 0;
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
    transition: var(--transition);
  }

  .modal-close:hover {
    background: rgba(148, 163, 184, 0.2);
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

  .modal-field input:focus,
  .modal-field select:focus {
    outline: none;
    border-color: var(--primary);
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

  .modal-summary div {
    background: rgba(148, 163, 184, 0.08);
    border-radius: 14px;
    padding: 0.85rem;
  }

  .modal-summary span {
    display: block;
    font-size: 0.76rem;
    color: var(--text-light);
    margin-bottom: 0.2rem;
  }

  .modal-summary strong {
    font-size: 1rem;
  }

  .modal-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(148, 163, 184, 0.08);
    border-radius: 14px;
    padding: 0.85rem;
    margin-bottom: 1rem;
  }

  .modal-total span {
    font-size: 0.9rem;
    color: var(--text-light);
  }

  .modal-total strong {
    font-size: 1.25rem;
    color: var(--primary);
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
    padding: 0 1.5rem;
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

    .lotes-grid {
      grid-template-columns: 1fr !important;
    }

    .lote-card {
      min-height: 380px;
    }

    .lote-datas {
      flex-direction: column;
      gap: 0.5rem;
    }

    .lote-stats {
      grid-template-columns: repeat(3, 1fr);
    }

    .modal-summary {
      grid-template-columns: 1fr;
    }

    .modal-actions {
      flex-direction: column;
    }

    .modal-actions button {
      width: 100%;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .lotes-grid--few {
      grid-template-columns: repeat(auto-fill, minmax(300px, 360px));
    }

    .lote-card {
      min-height: 400px;
    }
  }

  /* Aviso campeonato */
  .campeonato-aviso {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fef3c7;
    color: #92400e;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    margin-top: 1rem;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .campeonato-aviso i {
    font-size: 1rem;
  }

  /* Status finalizado */
  .status-finalizado {
    background: #64748b;
    color: white;
  }

  /* Overlays de status */
  .status-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    letter-spacing: 0.5px;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .overlay-esgotado {
    background: rgba(239, 68, 68, 0.95);
    color: white;
  }

  .overlay-encerrado {
    background: rgba(100, 116, 139, 0.95);
    color: white;
  }

  .overlay-cancelado {
    background: rgba(239, 68, 68, 0.95);
    color: white;
  }

  /* Cards encerrados/cancelados */
  .lote-card--encerrado,
  .lote-card--cancelado {
    opacity: 0.7;
    cursor: not-allowed;
    filter: grayscale(0.5);
  }

  .lote-card--encerrado:hover,
  .lote-card--cancelado:hover {
    transform: none;
    border-color: transparent;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .status-indisponivel {
    color: #94a3b8;
  }

  /* Status badge cores */
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

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
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
  </style>
