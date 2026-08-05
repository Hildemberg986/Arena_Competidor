<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Inscrições</h2>
        <p>Consulte, pesquise, baixe comprovantes e faça vendas presenciais.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="primary-btn" @click="abrirModalVenda">
          <i class="fa-solid fa-cart-plus"></i> Venda presencial
        </button>
      </div>
    </div>

    <p v-if="feedback" class="alert" :class="feedbackType">{{ feedback }}</p>

    <div class="admin-grid">
      <!-- Painel de busca -->
      <div class="panel search-panel">
        <div class="panel-header">
          <h3>Buscar inscrições</h3>
        </div>

        <div class="search-row">
          <div class="search-field">
            <label>Buscar por</label>
            <select v-model="searchType">
              <option value="todos">Todos</option>
              <option value="nome">Nome</option>
              <option value="cpf">CPF</option>
              <option value="compra_id">ID da Compra</option>
              <option value="codigo">Código do Ingresso</option>
            </select>
          </div>

          <div class="search-field">
            <label>{{ searchLabel }}</label>
            <div class="input-with-icon">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                @keyup.enter="buscarInscricoes"
                autofocus
              />
              <button
                class="btn-search"
                @click="buscarInscricoes"
                :disabled="loading || !searchQuery.trim()"
              >
                <i class="fa-solid fa-search"></i>
              </button>
            </div>
          </div>

          <div class="search-field" v-if="searchType === 'todos'">
            <label>Campeonato</label>
            <select v-model="campeonatoFilter">
              <option value="">Todos</option>
              <option v-for="c in campeonatos" :key="c.id" :value="c.id">
                {{ c.nome_campeonato }}
              </option>
            </select>
          </div>
        </div>

        <div class="search-actions">
          <button
            class="primary-btn"
            @click="buscarInscricoes"
            :disabled="loading"
          >
            <i class="fa-solid fa-search"></i> Buscar
          </button>
          <button class="secondary-btn" @click="limparBusca">
            <i class="fa-solid fa-rotate"></i> Limpar
          </button>
        </div>
      </div>

      <!-- Tabela de resultados -->
      <div class="panel table-panel">
        <div class="panel-header">
          <h3>Resultados</h3>
          <div class="header-info">
            <span class="total-count"
              >{{ ticketsFiltrados.length }} inscrições</span
            >
            <button
              v-if="ticketsFiltrados.length > 0"
              class="action-btn pdf-btn"
              @click="baixarPDFAgrupado"
              :disabled="pdfLoading"
            >
              <i
                class="fa-solid"
                :class="pdfLoading ? 'fa-spinner fa-spin' : 'fa-file-pdf'"
              ></i>
              {{ pdfLoading ? "Gerando..." : "Baixar selecionados" }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="state-box">
          <span class="spinner"></span>
          <p>Carregando inscrições...</p>
        </div>

        <div v-else-if="error" class="state-box error">
          <p>{{ error }}</p>
          <button class="secondary-btn" type="button" @click="buscarInscricoes">
            Tentar novamente
          </button>
        </div>

        <div v-else-if="!ticketsFiltrados.length" class="state-box">
          <p>Nenhuma inscrição encontrada.</p>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    v-model="selecionarTodos"
                    @change="toggleTodos"
                  />
                </th>
                <th>Código</th>
                <th>Compra #</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Campeonato</th>
                <th>Tipo / Lote</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Check-in</th>
                <th class="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in ticketsFiltrados" :key="ticket.id">
                <td>
                  <input
                    type="checkbox"
                    v-model="ticket.selecionado"
                    @change="atualizarSelecao"
                  />
                </td>
                <td>
                  <span class="code-text">{{ ticket.codigo_ingresso }}</span>
                </td>
                <td>
                  <span class="info-text"
                    >#{{ ticket.compra_id || ticket.id }}</span
                  >
                </td>
                <td>
                  <div class="info-cell">
                    <span class="info-main">{{ ticket.nome_completo }}</span>
                    <span class="info-sub">{{ ticket.email || "-" }}</span>
                  </div>
                </td>
                <td>
                  <span class="info-text">{{ formatarCPF(ticket.cpf) }}</span>
                </td>
                <td>
                  <span class="info-text">{{
                    ticket.nome_campeonato || "-"
                  }}</span>
                </td>
                <td>
                  <span class="info-text"
                    >{{ ticket.nome_tipo || "-" }} /
                    {{ ticket.nome_lote || "-" }}</span
                  >
                </td>
                <td>
                  <span class="price-text">{{
                    formatCurrency(ticket.valor_unitario)
                  }}</span>
                </td>
                <td>
                  <span
                    :class="[
                      'status-badge',
                      getStatusClass(ticket.status_pagamento),
                    ]"
                  >
                    {{ ticket.status_pagamento }}
                  </span>
                </td>
                <td>
                  <span v-if="ticket.checkin_em" class="checkin-badge">
                    <i class="fa-solid fa-check-double"></i>
                    {{ formatDateTime(ticket.checkin_em) }}
                  </span>
                  <span v-else class="info-text">-</span>
                </td>
                <td class="actions-cell">
                  <button
                    v-if="
                      ticket.status_pagamento === 'Aprovado' &&
                      !ticket.checkin_em
                    "
                    class="action-btn pdf-individual-btn"
                    @click="baixarPDFIndividual(ticket)"
                    :disabled="pdfLoadingIndividual[ticket.id]"
                  >
                    <i
                      class="fa-solid"
                      :class="
                        pdfLoadingIndividual[ticket.id]
                          ? 'fa-spinner fa-spin'
                          : 'fa-file-pdf'
                      "
                    ></i>
                    PDF
                  </button>
                  <button
                    v-if="ticket.mercado_pago_id === 'PRESENCIAL'"
                    class="action-btn reprint-btn"
                    @click="reimprimirVenda(ticket)"
                  >
                    <i class="fa-solid fa-print"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Venda Presencial -->
    <div
      v-if="showVendaModal"
      class="modal-overlay"
      @click.self="showVendaModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Venda Presencial</h3>
          <button
            type="button"
            class="modal-close"
            @click="showVendaModal = false"
          >
            ✕
          </button>
        </div>
        <div class="modal-form">
          <div v-if="vendaError" class="modal-error">{{ vendaError }}</div>

          <div class="form-grid">
            <div class="form-row span-2">
              <label>Campeonato *</label>
              <select v-model.number="vendaForm.campeonato_id" required>
                <option :value="0" disabled>Selecione</option>
                <option v-for="c in campeonatos" :key="c.id" :value="c.id">
                  {{ c.nome_campeonato }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <label>Quantidade *</label>
              <input
                v-model.number="vendaForm.quantidade"
                type="number"
                min="1"
                max="50"
                required
              />
            </div>
            <div class="form-row">
              <label>Valor unitário (R$) *</label>
              <input
                v-model.number="vendaForm.valor_unitario"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-row">
              <label>CPF (opcional)</label>
              <input
                v-model.trim="vendaForm.cpf"
                type="text"
                placeholder="000.000.000-00"
                maxlength="14"
              />
            </div>
          </div>

          <div class="modal-actions">
            <button class="secondary-btn" @click="showVendaModal = false">
              Cancelar
            </button>
            <button
              class="primary-btn"
              @click="realizarVendaPresencial"
              :disabled="vendaLoading"
            >
              <i v-if="vendaLoading" class="fa-solid fa-spinner fa-spin"></i>
              {{ vendaLoading ? "Gerando..." : "Gerar Ingressos" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { adminService } from "@/services/api";
import { getApiErrorMessage, unwrapCollection } from "@/utils/adminHelpers";

const tickets = ref([]);
const campeonatos = ref([]);
const loading = ref(false);
const pdfLoading = ref(false);
const pdfLoadingIndividual = ref({});
const error = ref("");
const feedback = ref("");
const feedbackType = ref("success");

const searchType = ref("todos");
const searchQuery = ref("");
const campeonatoFilter = ref("");
const selecionarTodos = ref(false);

const showVendaModal = ref(false);
const vendaLoading = ref(false);
const vendaError = ref("");
const vendaForm = ref({
  campeonato_id: 0,
  quantidade: 1,
  valor_unitario: 0,
  cpf: "",
});

const searchLabel = computed(() => {
  const labels = {
    todos: "Buscar",
    nome: "Nome",
    cpf: "CPF",
    compra_id: "ID Compra",
    codigo: "Código",
  };
  return labels[searchType.value] || "Buscar";
});

const searchPlaceholder = computed(() => {
  const p = {
    todos: "Digite para buscar...",
    nome: "Nome completo",
    cpf: "000.000.000-00",
    compra_id: "Número",
    codigo: "TKT-XXXXXXXX",
  };
  return p[searchType.value] || "Digite...";
});

const ticketsFiltrados = computed(() => {
  let resultado = tickets.value;
  if (campeonatoFilter.value) {
    resultado = resultado.filter(
      (t) => String(t.campeonato_id) === String(campeonatoFilter.value),
    );
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    resultado = resultado.filter((t) => {
      switch (searchType.value) {
        case "nome":
          return (t.nome_completo || "").toLowerCase().includes(q);
        case "cpf":
          return (t.cpf || "").includes(q.replace(/\D/g, ""));
        case "compra_id":
          return String(t.compra_id || t.id) === q;
        case "codigo":
          return (t.codigo_ingresso || "").toLowerCase().includes(q);
        default:
          return (
            (t.nome_completo || "").toLowerCase().includes(q) ||
            (t.cpf || "").includes(q.replace(/\D/g, "")) ||
            String(t.compra_id || t.id) === q ||
            (t.codigo_ingresso || "").toLowerCase().includes(q)
          );
      }
    });
  }
  return resultado;
});

function formatCurrency(v) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));
}
function formatDateTime(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatarCPF(c) {
  if (!c || c === "00000000000") return "-";
  const x = String(c).replace(/\D/g, "");
  return x.length === 11
    ? `${x.slice(0, 3)}.${x.slice(3, 6)}.${x.slice(6, 9)}-${x.slice(9)}`
    : c;
}
function getStatusClass(s) {
  const m = {
    Aprovado: "status-aprovado",
    Pendente: "status-pendente",
    Cancelado: "status-cancelado",
    Estornado: "status-estornado",
  };
  return m[s] || "status-pendente";
}
function toggleTodos() {
  ticketsFiltrados.value.forEach(
    (t) => (t.selecionado = selecionarTodos.value),
  );
}
function atualizarSelecao() {
  selecionarTodos.value = ticketsFiltrados.value.every((t) => t.selecionado);
}
function limparBusca() {
  searchQuery.value = "";
  searchType.value = "todos";
  campeonatoFilter.value = "";
  tickets.value = [];
}
function showMessage(m, t = "success") {
  feedback.value = m;
  feedbackType.value = t;
  setTimeout(() => (feedback.value = ""), 5000);
}

function abrirModalVenda() {
  vendaForm.value = {
    campeonato_id: campeonatos.value[0]?.id || 0,
    quantidade: 1,
    valor_unitario: 0,
    cpf: "",
  };
  vendaError.value = "";
  showVendaModal.value = true;
}

async function realizarVendaPresencial() {
  if (
    !vendaForm.value.campeonato_id ||
    vendaForm.value.quantidade < 1 ||
    vendaForm.value.valor_unitario <= 0
  ) {
    vendaError.value = "Preencha todos os campos obrigatórios.";
    return;
  }
  vendaLoading.value = true;
  vendaError.value = "";
  try {
    const blob = await adminService.vendaPresencialPDF({
      campeonato_id: vendaForm.value.campeonato_id,
      quantidade: vendaForm.value.quantidade,
      valor_unitario: vendaForm.value.valor_unitario,
      cpf: vendaForm.value.cpf || "",
    });
    baixarArquivo(blob, "venda-presencial.pdf");
    showVendaModal.value = false;
    showMessage("Venda realizada! PDF gerado.");
  } catch (err) {
    vendaError.value = err.message || "Erro ao processar venda.";
  } finally {
    vendaLoading.value = false;
  }
}

async function buscarInscricoes() {
  loading.value = true;
  error.value = "";
  try {
    const response = await adminService.getTickets();
    tickets.value = unwrapCollection(response).map((t) => ({
      ...t,
      selecionado: false,
    }));
  } catch (err) {
    error.value = getApiErrorMessage(err, "Erro ao buscar inscrições.");
  } finally {
    loading.value = false;
  }
}

function baixarArquivo(blob, nome) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

async function baixarPDFIndividual(ticket) {
  if (!ticket?.id) return;
  pdfLoadingIndividual.value[ticket.id] = true;
  try {
    const blob = await adminService.downloadTicketPDF(ticket.id);
    baixarArquivo(blob, `inscricao-${ticket.codigo_ingresso || ticket.id}.pdf`);
  } catch {
    showMessage("Erro ao baixar PDF.", "error");
  } finally {
    pdfLoadingIndividual.value[ticket.id] = false;
  }
}

async function baixarPDFAgrupado() {
  const sel = ticketsFiltrados.value.filter((t) => t.selecionado);
  if (!sel.length) {
    showMessage("Selecione inscrições.", "error");
    return;
  }
  pdfLoading.value = true;
  try {
    for (const t of sel) {
      try {
        const blob = await adminService.downloadTicketPDF(t.id);
        baixarArquivo(blob, `inscricao-${t.codigo_ingresso || t.id}.pdf`);
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    showMessage(`${sel.length} PDF(s) baixado(s)!`);
  } catch {
    showMessage("Erro ao baixar PDFs.", "error");
  } finally {
    pdfLoading.value = false;
  }
}

async function reimprimirVenda(ticket) {
  const compraId = ticket.compra_id || ticket.id;
  try {
    const blob = await adminService.reimprimirVenda(compraId);
    baixarArquivo(blob, `venda-presencial-${compraId}.pdf`);
    showMessage("PDF reimpresso!");
  } catch {
    showMessage("Erro ao reimprimir.", "error");
  }
}

async function loadCampeonatos() {
  try {
    campeonatos.value = unwrapCollection(await adminService.getCampeonatos());
  } catch {
    console.error("Erro campeonatos");
  }
}

onMounted(() => {
  loadCampeonatos();
  buscarInscricoes();
});
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 1rem;
  padding: 0.75rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}
.page-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 1rem 1.25rem;
  background: var(--card);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
}
.page-header h2 {
  margin-top: 0.2rem;
  font-size: 1.3rem;
}
.page-header p {
  color: var(--text-light);
  font-size: 0.8rem;
  margin: 0;
}
.header-actions {
  display: flex;
  gap: 0.5rem;
}

.alert {
  border-radius: 14px;
  padding: 0.75rem 0.85rem;
  font-weight: 700;
  font-size: 0.85rem;
}
.alert.success {
  background: #ecfdf5;
  color: #047857;
}
.alert.error {
  background: #fef2f2;
  color: #b91c1c;
}

.admin-grid {
  display: grid;
  gap: 1rem;
}
.panel {
  background: var(--card);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1rem 1.25rem;
}
.panel-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h3 {
  font-size: 1.1rem;
  margin: 0;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.total-count {
  font-size: 0.75rem;
  color: var(--text-light);
  background: #f1f5f9;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
}

.search-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.search-field label {
  display: block;
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
}
.search-field select,
.search-field input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  font: inherit;
  font-size: 0.85rem;
  background: #fff;
  box-sizing: border-box;
}
.input-with-icon {
  display: flex;
  gap: 0.35rem;
}
.input-with-icon input {
  flex: 1;
}
.btn-search {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0 0.8rem;
  cursor: pointer;
}
.search-actions {
  display: flex;
  gap: 0.5rem;
}

.table-wrap {
  overflow-x: auto;
  margin: 0 -0.25rem;
  padding: 0 0.25rem;
  -webkit-overflow-scrolling: touch;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
}
th,
td {
  padding: 0.65rem 0.4rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}
th {
  color: var(--text-light);
  font-size: 0.68rem;
  text-transform: uppercase;
  font-weight: 700;
  white-space: nowrap;
}
tbody tr:hover {
  background-color: #f8fafc;
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.info-main {
  font-weight: 600;
  font-size: 0.82rem;
}
.info-sub {
  font-size: 0.7rem;
  color: var(--text-light);
}
.info-text {
  font-weight: 500;
  font-size: 0.82rem;
}
.code-text {
  font-family: monospace;
  font-weight: 700;
  color: var(--primary);
  font-size: 0.75rem;
}
.price-text {
  font-weight: 700;
  color: var(--primary);
  font-size: 0.82rem;
}
.checkin-badge {
  font-size: 0.65rem;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
}

.actions-cell {
  display: flex;
  gap: 0.3rem;
  justify-content: center;
}
.action-btn,
.pdf-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.55rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 600;
  font-size: 0.7rem;
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}
.pdf-btn {
  background: #fef2f2;
  color: var(--primary);
  border-color: rgba(230, 33, 23, 0.2);
}
.pdf-individual-btn {
  background: #dcfce7;
  color: #15803d;
  border-color: rgba(21, 128, 61, 0.2);
}
.reprint-btn {
  background: #e0e7ff;
  color: #4338ca;
  border-color: rgba(67, 56, 202, 0.2);
}

.status-badge {
  display: inline-flex;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  white-space: nowrap;
}
.status-aprovado {
  background: #dcfce7;
  color: #15803d;
}
.status-pendente {
  background: #fef3c7;
  color: #92400e;
}
.status-cancelado {
  background: #fee2e2;
  color: #dc2626;
}
.status-estornado {
  background: #f1f5f9;
  color: #64748b;
}

.primary-btn,
.secondary-btn {
  border-radius: 12px;
  border: 1px solid transparent;
  padding: 0.55rem 1rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  -webkit-tap-highlight-color: transparent;
}
.primary-btn {
  background: var(--primary);
  color: #fff;
}
.primary-btn:disabled {
  opacity: 0.6;
}
.secondary-btn {
  background: #fff;
  color: var(--text);
  border-color: #cbd5e1;
}

.state-box {
  min-height: 150px;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.5rem;
  color: var(--text-light);
  padding: 2rem;
}
.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2.5px solid rgba(230, 33, 23, 0.15);
  border-top-color: var(--primary);
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--card);
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2);
  padding-bottom: env(safe-area-inset-bottom);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: var(--card);
  z-index: 1;
}
.modal-header h3 {
  font-size: 1.15rem;
}
.modal-close {
  background: #f1f5f9;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}
.modal-form {
  padding: 1.25rem;
}
.modal-error {
  background: #fef2f2;
  color: #b91c1c;
  padding: 0.65rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.85rem;
}
.form-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr 1fr;
}
.form-row {
  display: flex;
  flex-direction: column;
}
.form-row.span-2 {
  grid-column: span 2;
}
.form-row label {
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}
.form-row input,
.form-row select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.65rem;
  font: inherit;
  font-size: 0.85rem;
  background: #fff;
  box-sizing: border-box;
}
.modal-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  margin-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}
.modal-actions button {
  flex: 1;
}
</style>
