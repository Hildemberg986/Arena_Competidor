<template>
  <div class="tickets-page">
    <section class="tickets-hero">
      <div>
        <p class="eyebrow">Minha conta</p>
        <h1>Meus ingressos</h1>
        <p class="subtitle">Lista organizada por compra.</p>
      </div>

      <router-link class="back-btn" to="/">
        <i class="fa-solid fa-arrow-left"></i>
        Voltar
      </router-link>
    </section>

    <div v-if="loading" class="loading-state">
      <i class="fa-solid fa-spinner"></i>
      <p>Carregando seus ingressos...</p>
    </div>

    <div v-else-if="!isAuthenticated" class="empty-state">
      <i class="fa-solid fa-user-lock"></i>
      <h3>Faça login para ver seus ingressos</h3>
      <p>Entre na sua conta para acessar a lista completa.</p>
      <router-link
        class="primary-action"
        :to="{ name: 'login', query: { redirect: '/meus-ingressos' } }"
      >
        Ir para login
      </router-link>
    </div>

    <div v-else-if="error" class="empty-state error">
      <i class="fa-solid fa-circle-exclamation"></i>
      <h3>Não foi possível carregar seus ingressos</h3>
      <p>{{ error }}</p>
      <button class="primary-action" type="button" @click="loadTickets">
        Tentar novamente
      </button>
    </div>

    <div v-else-if="!comprasAgrupadas.length" class="empty-state">
      <i class="fa-solid fa-ticket"></i>
      <h3>Você ainda não possui ingressos</h3>
      <p>Quando comprar um ingresso, ele vai aparecer organizado aqui por compra.</p>
    </div>

    <div v-else class="tickets-groups">
      <article
        v-for="compra in comprasAgrupadas"
        :key="compra.compra_id"
        class="ticket-group"
      >
        <div class="group-header">
          <div>
            <p class="group-kicker">{{ compra.campeonato }}</p>
            <h2>{{ compra.lote }} / {{ compra.tipo }}</h2>
            <p class="group-location" v-if="compra.local">
              <i class="fa-solid fa-location-dot"></i>
              {{ compra.local }}
            </p>
          </div>
          <span class="group-count">{{ compra.quantidade }} ingresso(s)</span>
        </div>

        <div class="group-summary">
          <div class="summary-row">
            <span>Valor unitário</span>
            <strong>{{ formatCurrency(compra.valor_unitario) }}</strong>
          </div>
          <div class="summary-row">
            <span>Valor total</span>
            <strong class="total-price">{{ formatCurrency(compra.valor_total) }}</strong>
          </div>
          <div class="summary-row">
            <span>Status</span>
            <span :class="['status-badge', getStatusClass(compra.status)]">
              {{ getStatusLabel(compra.status) }}
            </span>
          </div>
          <div class="summary-row">
            <span>Data</span>
            <span>{{ formatDateTime(compra.data) }}</span>
          </div>
        </div>

        <!-- Ingressos individuais (aprovados) -->
        <div v-if="compra.status === 'Aprovado'" class="group-tickets">
          <p class="tickets-title">Ingressos:</p>
          <div class="tickets-list">
            <div
              v-for="ticket in compra.tickets"
              :key="ticket.id"
              class="ticket-row"
            >
              <div class="ticket-row-info">
                <span class="code-chip">{{ ticket.codigo_ingresso }}</span>
                <span v-if="ticket.checkin_em" class="checkin-badge">
                  <i class="fa-solid fa-check-double"></i> Usado
                </span>
              </div>
              <button
                v-if="!ticket.checkin_em"
                class="btn-download-individual"
                @click="baixarPDFIndividual(ticket)"
                :disabled="pdfLoading[ticket.id]"
              >
                <i class="fa-solid fa-download"></i>
                {{ pdfLoading[ticket.id] ? '...' : 'PDF' }}
              </button>
            </div>
          </div>
        </div>

        <div class="group-actions">
          <button
            v-if="compra.status === 'Pendente' && compra.payment_url"
            class="btn-pay"
            @click="irParaPagamento(compra)"
            :disabled="paymentLoading[compra.compra_id]"
          >
            <i class="fa-solid fa-credit-card"></i>
            {{ paymentLoading[compra.compra_id] ? 'Processando...' : 'Pagar agora' }}
          </button>

          <span v-if="compra.status === 'Aprovado'" class="status-confirmed">
            <i class="fa-solid fa-check-circle"></i>
            Confirmado
          </span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { authService, ticketsService } from "@/services/api";

const router = useRouter();
const isAuthenticated = ref(false);
const loading = ref(true);
const error = ref("");
const tickets = ref([]);
const paymentLoading = ref({});
const pdfLoading = ref({});

const comprasAgrupadas = computed(() => {
  const grupos = new Map();

  tickets.value.forEach(t => {
    const chave = t.compra_id || t.id;

    if (!grupos.has(chave)) {
      grupos.set(chave, {
        compra_id: chave,
        campeonato: t.nome_campeonato || '-',
        local: t.local_campeonato || '',
        lote: t.nome_lote || '-',
        tipo: t.nome_tipo || '-',
        quantidade: 0,
        valor_unitario: t.valor_unitario || 0,
        valor_total: 0,
        status: t.status_pagamento,
        data: t.data_criacao,
        payment_url: t.payment_url,
        tickets: [],
      });
    }

    const grupo = grupos.get(chave);
    grupo.quantidade += 1;
    grupo.valor_total += Number(t.total || t.valor_unitario || 0);
    grupo.tickets.push(t);
  });

  return Array.from(grupos.values());
});

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getStatusClass(status) {
  const map = {
    'Pendente': 'status-pending',
    'Aprovado': 'status-approved',
    'Cancelado': 'status-cancelled',
    'Estornado': 'status-refunded',
    'Rejeitado': 'status-rejected',
  };
  return map[status] || 'status-pending';
}

function getStatusLabel(status) {
  const map = {
    'Pendente': '⏳ Pendente',
    'Aprovado': '✅ Aprovado',
    'Cancelado': '🚫 Cancelado',
    'Estornado': '↩️ Estornado',
    'Rejeitado': '❌ Rejeitado',
  };
  return map[status] || status;
}

function irParaPagamento(compra) {
  if (!compra.payment_url) return;
  paymentLoading.value[compra.compra_id] = true;
  window.open(compra.payment_url, "_blank");
  setTimeout(() => {
    paymentLoading.value[compra.compra_id] = false;
    loadTickets();
  }, 5000);
}

function baixarArquivo(blob, nomeArquivo) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function baixarPDFIndividual(ticket) {
  if (!ticket?.id) return;
  if (ticket.checkin_em) {
    alert('Este ingresso já foi utilizado e não pode ser baixado.');
    return;
  }

  pdfLoading.value[ticket.id] = true;

  try {
    const blob = await ticketsService.downloadTicketPDF(ticket.id);
    const nomeArquivo = `ingresso-${ticket.codigo_ingresso || ticket.id}.pdf`;
    baixarArquivo(blob, nomeArquivo);
  } catch (err) {
    const mensagem = err?.response?.data?.detail || err.message || 'Erro ao baixar o ingresso.';
    alert(mensagem);
  } finally {
    pdfLoading.value[ticket.id] = false;
  }
}

async function loadTickets() {
  if (!isAuthenticated.value) return;
  loading.value = true;
  error.value = "";

  try {
    const response = await ticketsService.getMyTickets();
    tickets.value = response?.data || response || [];
  } catch (err) {
    error.value = err?.response?.data?.detail || err.message || "Falha ao carregar ingressos";
  } finally {
    loading.value = false;
  }
}

async function checkAuth() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    isAuthenticated.value = false;
    loading.value = false;
    return;
  }

  try {
    await authService.me();
    isAuthenticated.value = true;
    await loadTickets();
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    isAuthenticated.value = false;
    loading.value = false;
  }
}

onMounted(() => {
  checkAuth();
});
</script>

<style scoped>
.tickets-page {
  display: grid;
  gap: 1.25rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.tickets-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
}

.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.tickets-hero h1 {
  font-size: 2rem;
  margin-top: 0.25rem;
}

.subtitle {
  color: var(--text-light);
  margin-top: 0.25rem;
}

.back-btn,
.primary-action {
  border: 0;
  border-radius: 14px;
  background: var(--primary);
  color: #fff;
  padding: 0.8rem 1rem;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
}

.empty-state,
.loading-state {
  min-height: 340px;
  border-radius: 24px;
  background: var(--card);
  box-shadow: var(--shadow);
  display: grid;
  place-items: center;
  text-align: center;
  padding: 2rem;
  gap: 0.75rem;
}

.empty-state i,
.loading-state i {
  font-size: 2.5rem;
  color: var(--primary);
}

.loading-state i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state.error i { color: #b91c1c; }
.empty-state p, .loading-state p { color: var(--text-light); }

.tickets-groups {
  display: grid;
  gap: 1rem;
}

.ticket-group {
  background: var(--card);
  border-radius: 24px;
  box-shadow: var(--shadow);
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.group-kicker {
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 800;
}

.group-header h2 {
  margin-top: 0.2rem;
  font-size: 1.15rem;
}

.group-location {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-top: 0.3rem;
}

.group-location i {
  color: var(--primary);
  margin-right: 0.3rem;
}

.group-count {
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 800;
  font-size: 0.78rem;
  white-space: nowrap;
}

.group-summary {
  display: grid;
  gap: 0.5rem;
  background: #f8fafc;
  border-radius: 14px;
  padding: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row span {
  color: var(--text-light);
  font-size: 0.9rem;
}

.summary-row strong {
  font-size: 0.95rem;
}

.total-price {
  color: var(--primary);
  font-size: 1.1rem !important;
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-approved { background: rgba(16, 185, 129, 0.15); color: #065f46; }
.status-pending { background: rgba(245, 158, 11, 0.15); color: #92400e; }
.status-cancelled { background: rgba(107, 114, 128, 0.15); color: #374151; }
.status-refunded { background: rgba(107, 114, 128, 0.15); color: #374151; }
.status-rejected { background: rgba(239, 68, 68, 0.15); color: #991b1b; }

.group-tickets {
  background: #f0fdf4;
  border-radius: 12px;
  padding: 1rem;
}

.tickets-title {
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: #065f46;
}

.tickets-list {
  display: grid;
  gap: 0.5rem;
}

.ticket-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: white;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
}

.ticket-row-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.code-chip {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 600;
}

.checkin-badge {
  font-size: 0.7rem;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}

.btn-download-individual {
  border: none;
  background: #dcfce7;
  color: #15803d;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: inherit;
}

.btn-download-individual:hover:not(:disabled) {
  background: #bbf7d0;
}

.btn-download-individual:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-pay {
  border: none;
  border-radius: 12px;
  padding: 0.7rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  background: var(--primary);
  color: white;
}

.btn-pay:hover:not(:disabled) {
  background: #c81e14;
  transform: translateY(-2px);
}

.btn-pay:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-confirmed {
  color: #10b981;
  font-weight: 800;
  font-size: 0.95rem;
}

.status-confirmed i {
  margin-right: 0.4rem;
}

@media (max-width: 768px) {
  .tickets-hero {
    flex-direction: column;
    align-items: start;
  }

  .tickets-hero h1 {
    font-size: 1.6rem;
  }

  .ticket-group {
    padding: 1rem;
  }

  .group-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-pay {
    justify-content: center;
  }

  .ticket-row {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-download-individual {
    justify-content: center;
  }
}
</style>