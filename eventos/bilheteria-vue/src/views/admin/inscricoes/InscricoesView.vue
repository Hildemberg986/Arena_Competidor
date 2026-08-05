<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Inscrições</h2>
        <p>Consulte, pesquise e faça vendas presenciais.</p>
      </div>
      <button class="primary-btn" @click="abrirModalVenda">
        <i class="fa-solid fa-cart-plus"></i> Venda presencial
      </button>
    </div>

    <div class="search-bar">
      <select v-model="searchType" class="search-select">
        <option value="todos">Todos</option>
        <option value="nome">Nome</option>
        <option value="cpf">CPF</option>
        <option value="compra_id">Compra</option>
        <option value="codigo">Código</option>
      </select>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholderBusca"
        @keyup.enter="buscarInscricoes"
        class="search-input"
      />
      <select v-model="filtroCampeonato" class="search-select">
        <option value="">Todos os campeonatos</option>
        <option v-for="c in campeonatos" :key="c.id" :value="c.id">
          {{ c.nome_campeonato }}
        </option>
      </select>
      <button class="secondary-btn" @click="limparBusca">Limpar</button>
    </div>

    <div v-if="loading" class="state-box">
      <span class="spinner"></span>
      <p>Carregando...</p>
    </div>

    <div v-else-if="error" class="state-box error">
      <p>{{ error }}</p>
      <button class="secondary-btn" @click="buscarInscricoes">
        Tentar novamente
      </button>
    </div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Compra</th>
            <th>Cliente</th>
            <th>CPF</th>
            <th>Campeonato</th>
            <th>Qtd</th>
            <th>Usados</th>
            <th>Valor</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="compra in comprasFiltradas" :key="compra.compra_id">
            <td>
              <span class="code-text">#{{ compra.compra_id }}</span>
            </td>
            <td>
              <div class="info-cell">
                <span class="info-main">{{ compra.cliente }}</span>
                <span class="info-sub">{{ compra.email || "-" }}</span>
              </div>
            </td>
            <td>{{ formatarCPF(compra.cpf) }}</td>
            <td>{{ compra.campeonato || "-" }}</td>
            <td>
              <span class="badge badge-gray">{{ compra.quantidade }}</span>
            </td>
            <td>
              <span v-if="compra.checkins > 0" class="badge badge-blue">
                <i class="fa-solid fa-check-double"></i>
                {{ compra.checkins }}/{{ compra.quantidade }}
              </span>
              <span v-else class="text-muted">-</span>
            </td>
            <td class="price-text">{{ formatCurrency(compra.valor_total) }}</td>
            <td>
              <span :class="['badge', getStatusClass(compra.status)]">{{
                compra.status
              }}</span>
            </td>
            <td>
              <div class="action-group">
                <button
                  class="action-btn"
                  @click="abrirDetalhes(compra)"
                  title="Detalhes"
                >
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button
                  v-if="compra.tipo === 'presencial'"
                  class="action-btn"
                  @click="reimprimirVenda(compra.compra_id)"
                  title="Reimprimir"
                >
                  <i class="fa-solid fa-print"></i>
                </button>
                <button
                  v-else-if="temIngressosDisponiveis(compra)"
                  class="action-btn"
                  @click="baixarPDFsCompra(compra)"
                  :disabled="pdfLoading[compra.compra_id]"
                  title="Baixar PDFs"
                >
                  <i
                    :class="
                      pdfLoading[compra.compra_id]
                        ? 'fa-solid fa-spinner fa-spin'
                        : 'fa-solid fa-download'
                    "
                  ></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!comprasFiltradas.length" class="state-box">
        <p>Nenhuma inscrição encontrada.</p>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="showModal = false"
      >
        <div class="modal">
          <div class="modal-header">
            <h3>Compra #{{ compraSelecionada?.compra_id }}</h3>
            <button class="modal-close" @click="showModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="compra-info">
              <div class="info-item">
                <span class="label">Cliente</span>
                <span class="value">{{ compraSelecionada?.cliente }}</span>
              </div>
              <div class="info-item">
                <span class="label">CPF</span>
                <span class="value">{{
                  formatarCPF(compraSelecionada?.cpf)
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">Campeonato</span>
                <span class="value">{{ compraSelecionada?.campeonato }}</span>
              </div>
              <div class="info-item">
                <span class="label">Total</span>
                <span class="value price">{{
                  formatCurrency(compraSelecionada?.valor_total)
                }}</span>
              </div>
            </div>

            <h4>
              Ingressos ({{ compraSelecionada?.checkins || 0 }}/{{
                compraSelecionada?.quantidade
              }}
              usados)
            </h4>
            <div class="ingressos-list">
              <div
                v-for="ticket in compraSelecionada?.tickets"
                :key="ticket.id"
                class="ingresso-card"
              >
                <div class="ingresso-header">
                  <span class="code-text">{{ ticket.codigo_ingresso }}</span>
                  <span v-if="ticket.checkin_em" class="badge badge-green"
                    >Usado</span
                  >
                  <span v-else class="badge badge-gray">Disponível</span>
                </div>
                <div class="ingresso-info">
                  <span>{{ ticket.nome_completo || "-" }}</span>
                  <span v-if="ticket.checkin_em" class="checkin-date">
                    {{ formatDateTime(ticket.checkin_em) }}
                  </span>
                </div>
                <button
                  v-if="
                    !ticket.checkin_em && ticket.status_pagamento === 'Aprovado'
                  "
                  class="secondary-btn small"
                  @click="baixarPDFIndividual(ticket)"
                  :disabled="pdfLoading[ticket.id]"
                >
                  <i
                    :class="
                      pdfLoading[ticket.id]
                        ? 'fa-solid fa-spinner fa-spin'
                        : 'fa-solid fa-file-pdf'
                    "
                  ></i>
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Venda Presencial -->
    <Teleport to="body">
      <div
        v-if="showVendaModal"
        class="modal-overlay"
        @click.self="showVendaModal = false"
      >
        <div class="modal">
          <div class="modal-header">
            <h3>Venda Presencial</h3>
            <button class="modal-close" @click="showVendaModal = false">
              ✕
            </button>
          </div>
          <div class="modal-body">
            <div v-if="vendaError" class="error-msg">{{ vendaError }}</div>
            <div class="form-group">
              <label>Campeonato</label>
              <select v-model.number="vendaForm.campeonato_id">
                <option :value="0" disabled>Selecione</option>
                <option v-for="c in campeonatos" :key="c.id" :value="c.id">
                  {{ c.nome_campeonato }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Quantidade</label>
                <input
                  v-model.number="vendaForm.quantidade"
                  type="number"
                  min="1"
                  max="50"
                />
              </div>
              <div class="form-group">
                <label>Valor unitário</label>
                <input
                  v-model.number="vendaForm.valor_unitario"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div class="form-group">
              <label>CPF (opcional)</label>
              <input
                v-model.trim="vendaForm.cpf"
                type="text"
                placeholder="000.000.000-00"
              />
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
                {{ vendaLoading ? "Gerando..." : "Gerar Ingressos" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { adminService } from "@/services/api";
import { getApiErrorMessage, unwrapCollection } from "@/utils/adminHelpers";

const tickets = ref([]);
const campeonatos = ref([]);
const loading = ref(false);
const pdfLoading = ref({});
const error = ref("");
const searchType = ref("todos");
const searchQuery = ref("");
const filtroCampeonato = ref("");

const showModal = ref(false);
const compraSelecionada = ref(null);

const showVendaModal = ref(false);
const vendaLoading = ref(false);
const vendaError = ref("");
const vendaForm = ref({
  campeonato_id: 0,
  quantidade: 1,
  valor_unitario: 0,
  cpf: "",
});

const placeholderBusca = computed(() => {
  const placeholders = {
    todos: "Buscar por nome, CPF ou compra...",
    nome: "Digite o nome...",
    cpf: "000.000.000-00",
    compra_id: "Número da compra...",
    codigo: "TKT-XXXXXXXX",
  };
  return placeholders[searchType.value] || "Buscar...";
});

const comprasAgrupadas = computed(() => {
  const grupos = new Map();
  tickets.value.forEach((t) => {
    const chave = t.compra_id || t.id;
    if (!grupos.has(chave)) {
      const isPresencial = t.mercado_pago_id === "PRESENCIAL";
      grupos.set(chave, {
        compra_id: chave,
        cliente: isPresencial ? "Venda Presencial" : t.nome_completo,
        email: t.email,
        cpf: t.cpf,
        campeonato: t.nome_campeonato,
        campeonato_id: t.campeonato_id,
        quantidade: 0,
        checkins: 0,
        valor_total: 0,
        status: t.status_pagamento,
        tipo: isPresencial ? "presencial" : "online",
        tickets: [],
      });
    }
    const g = grupos.get(chave);
    g.quantidade += 1;
    g.valor_total += Number(t.total || t.valor_unitario || 0);
    if (t.checkin_em) g.checkins += 1;
    g.tickets.push(t);
  });

  return Array.from(grupos.values());
});

const comprasFiltradas = computed(() => {
  let resultado = comprasAgrupadas.value;

  // Filtro por campeonato
  if (filtroCampeonato.value) {
    resultado = resultado.filter(
      (g) => g.campeonato_id == filtroCampeonato.value,
    );
  }

  // Filtro por busca textual
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    resultado = resultado.filter((g) => {
      switch (searchType.value) {
        case "nome":
          return (g.cliente || "").toLowerCase().includes(q);
        case "cpf":
          return (g.cpf || "")
            .replace(/\D/g, "")
            .includes(q.replace(/\D/g, ""));
        case "compra_id":
          return String(g.compra_id) === q;
        case "codigo":
          return g.tickets?.some((t) =>
            (t.codigo_ingresso || "").toLowerCase().includes(q),
          );
        case "todos":
        default:
          // Busca em todos os campos + códigos dos ingressos
          return (
            (g.cliente || "").toLowerCase().includes(q) ||
            (g.cpf || "").replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
            String(g.compra_id).includes(q) ||
            g.tickets?.some((t) =>
              (t.codigo_ingresso || "").toLowerCase().includes(q),
            )
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
  }).format(v || 0);
}

function formatDateTime(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("pt-BR");
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
    Aprovado: "badge-green",
    Pendente: "badge-yellow",
    Cancelado: "badge-red",
  };
  return m[s] || "badge-gray";
}

function limparBusca() {
  searchQuery.value = "";
  searchType.value = "todos";
  filtroCampeonato.value = "";
}

function abrirDetalhes(compra) {
  compraSelecionada.value = compra;
  showModal.value = true;
}

function temIngressosDisponiveis(compra) {
  return compra?.tickets?.some(
    (t) => t.status_pagamento === "Aprovado" && !t.checkin_em,
  );
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
    const blob = await adminService.vendaPresencialPDF(vendaForm.value);
    downloadBlob(blob, "venda-presencial.pdf");
    showVendaModal.value = false;
    await buscarInscricoes();
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
    const data = unwrapCollection(await adminService.getTickets());
    tickets.value = Array.isArray(data) ? data : [];
  } catch (err) {
    error.value = getApiErrorMessage(err, "Erro ao buscar inscrições.");
  } finally {
    loading.value = false;
  }
}

function downloadBlob(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

async function baixarPDFIndividual(ticket) {
  if (!ticket?.id) return;
  pdfLoading.value[ticket.id] = true;
  try {
    downloadBlob(
      await adminService.downloadTicketPDF(ticket.id),
      `ingresso-${ticket.codigo_ingresso || ticket.id}.pdf`,
    );
  } catch {
    error.value = "Erro ao baixar PDF.";
  } finally {
    pdfLoading.value[ticket.id] = false;
  }
}

async function baixarPDFsCompra(compra) {
  pdfLoading.value[compra.compra_id] = true;
  try {
    for (const t of compra.tickets.filter(
      (t) => t.status_pagamento === "Aprovado" && !t.checkin_em,
    )) {
      downloadBlob(
        await adminService.downloadTicketPDF(t.id),
        `ingresso-${t.codigo_ingresso || t.id}.pdf`,
      );
      await new Promise((r) => setTimeout(r, 300));
    }
  } catch {
    error.value = "Erro ao baixar PDFs.";
  } finally {
    pdfLoading.value[compra.compra_id] = false;
  }
}

async function reimprimirVenda(compraId) {
  try {
    downloadBlob(
      await adminService.reimprimirVenda(compraId),
      `venda-${compraId}.pdf`,
    );
  } catch {
    error.value = "Erro ao reimprimir.";
  }
}

onMounted(async () => {
  try {
    campeonatos.value = unwrapCollection(await adminService.getCampeonatos());
  } catch {}
  await buscarInscricoes();
});
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  display: grid;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.eyebrow {
  color: var(--primary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

.page-header h2 {
  font-size: 1.5rem;
  margin: 0.25rem 0;
}

.page-header p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.search-bar {
  display: flex;
  gap: 0.75rem;
  background: #fff;
  padding: 0.75rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.search-select {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #fff;
  min-width: 140px;
}

.search-input {
  flex: 1;
  min-width: 180px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

.table-wrap {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
  border-bottom: 1px solid #f1f5f9;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.875rem;
}

tr:hover {
  background: #f8fafc;
}

.code-text {
  font-family: monospace;
  color: var(--primary);
  font-weight: 600;
  font-size: 0.8rem;
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.info-main {
  font-weight: 600;
}

.info-sub {
  font-size: 0.75rem;
  color: #94a3b8;
}

.price-text {
  font-weight: 600;
  color: var(--primary);
}

.text-muted {
  color: #94a3b8;
  font-size: 0.8rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-green {
  background: #dcfce7;
  color: #15803d;
}
.badge-yellow {
  background: #fef3c7;
  color: #92400e;
}
.badge-red {
  background: #fee2e2;
  color: #dc2626;
}
.badge-gray {
  background: #f1f5f9;
  color: #64748b;
}
.badge-blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-group {
  display: flex;
  gap: 0.35rem;
}

.action-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e2e8f0;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-btn,
.secondary-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.primary-btn {
  background: var(--primary);
  color: #fff;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-btn {
  background: #f1f5f9;
  color: #475569;
}

.secondary-btn:hover {
  background: #e2e8f0;
}

.secondary-btn.small {
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
}

.state-box {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.state-box.error {
  color: #dc2626;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  border-top-color: var(--primary);
  animation: spin 0.8s linear infinite;
  display: inline-block;
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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  background: #fff;
}

.modal-header h3 {
  font-size: 1.1rem;
}

.modal-close {
  background: #f1f5f9;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

.modal-body {
  padding: 1.25rem;
}

.compra-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.info-item .label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
}

.info-item .value {
  font-weight: 600;
  font-size: 0.875rem;
}

.info-item .value.price {
  color: var(--primary);
}

.modal-body h4 {
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  color: #475569;
}

.ingressos-list {
  display: grid;
  gap: 0.5rem;
}

.ingresso-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.ingresso-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ingresso-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.8rem;
}

.checkin-date {
  font-size: 0.7rem;
  color: #94a3b8;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.8rem;
  color: #475569;
}

.form-group input,
.form-group select {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  background: #fff;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.modal-actions button {
  flex: 1;
}

.error-msg {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.65rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

@media (min-width: 769px) {
  .modal {
    border-radius: 16px;
    margin: auto;
  }
}

@media (max-width: 480px) {
  .admin-page {
    padding: 0.75rem;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-select,
  .search-input {
    width: 100%;
  }

  .compra-info {
    grid-template-columns: 1fr;
  }
}
</style>
