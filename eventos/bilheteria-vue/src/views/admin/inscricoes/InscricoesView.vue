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
      <div class="panel search-panel">
        <div class="panel-header"><h3>Buscar inscrições</h3></div>
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
              />
              <button
                class="btn-search"
                @click="buscarInscricoes"
                :disabled="loading"
              >
                <i class="fa-solid fa-search"></i>
              </button>
            </div>
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

      <div class="panel table-panel">
        <div class="panel-header">
          <h3>Resultados</h3>
          <span class="total-count">{{ comprasAgrupadas.length }} compras</span>
        </div>

        <div v-if="loading" class="state-box">
          <span class="spinner"></span>
          <p>Carregando inscrições...</p>
        </div>
        <div v-else-if="error" class="state-box error">
          <p>{{ error }}</p>
          <button class="secondary-btn" @click="buscarInscricoes">
            Tentar novamente
          </button>
        </div>
        <div v-else-if="!comprasAgrupadas.length" class="state-box">
          <p>Nenhuma inscrição encontrada.</p>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width: 40px"></th>
                <th>Compra</th>
                <th>Cliente</th>
                <th>CPF</th>
                <th>Campeonato</th>
                <th>Qtd</th>
                <th>Valor total</th>
                <th>Status</th>
                <th>Check-in</th>
                <th class="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              <template
                v-for="compra in comprasAgrupadas"
                :key="compra.compra_id"
              >
                <tr
                  class="clickable-row"
                  :class="{ 'row-expanded': compra.expandido }"
                >
                  <td class="expand-cell" @click="toggleDetalhes(compra)">
                    <i
                      :class="
                        compra.expandido
                          ? 'fa-solid fa-chevron-down'
                          : 'fa-solid fa-chevron-right'
                      "
                      class="expand-icon"
                    ></i>
                  </td>
                  <td @click="toggleDetalhes(compra)">
                    <span class="code-text">#{{ compra.compra_id }}</span>
                    <span
                      v-if="compra.tipo === 'presencial'"
                      class="presencial-badge"
                      >Presencial</span
                    >
                  </td>
                  <td @click="toggleDetalhes(compra)">
                    <div class="info-cell">
                      <span class="info-main">{{ compra.cliente }}</span>
                      <span class="info-sub">{{ compra.email || "-" }}</span>
                    </div>
                  </td>
                  <td @click="toggleDetalhes(compra)">
                    <span class="info-text">{{ formatarCPF(compra.cpf) }}</span>
                  </td>
                  <td @click="toggleDetalhes(compra)">
                    <span class="info-text">{{
                      compra.campeonato || "-"
                    }}</span>
                  </td>
                  <td @click="toggleDetalhes(compra)">
                    <span class="qtd-badge">{{ compra.quantidade }}</span>
                  </td>
                  <td @click="toggleDetalhes(compra)">
                    <span class="price-text">{{
                      formatCurrency(compra.valor_total)
                    }}</span>
                  </td>
                  <td @click="toggleDetalhes(compra)">
                    <span
                      :class="['status-badge', getStatusClass(compra.status)]"
                      >{{ compra.status }}</span
                    >
                  </td>
                  <td @click="toggleDetalhes(compra)">
                    <span v-if="compra.checkins > 0" class="checkin-badge"
                      ><i class="fa-solid fa-check-double"></i>
                      {{ compra.checkins }}/{{ compra.quantidade }}</span
                    >
                    <span v-else class="info-text">-</span>
                  </td>
                  <td class="actions-cell" @click.stop>
                    <button
                      v-if="compra.tipo === 'presencial'"
                      class="action-btn reprint-btn"
                      @click.stop="reimprimirVenda(compra.compra_id)"
                    >
                      <i class="fa-solid fa-print"></i> Reimprimir
                    </button>
                    <button
                      v-else-if="
                        compra.status === 'Aprovado' &&
                        temIngressosDisponiveis(compra)
                      "
                      class="action-btn pdf-btn"
                      @click.stop="baixarPDFsCompra(compra)"
                      :disabled="pdfLoading[compra.compra_id]"
                    >
                      <i
                        :class="
                          pdfLoading[compra.compra_id]
                            ? 'fa-solid fa-spinner fa-spin'
                            : 'fa-solid fa-download'
                        "
                      ></i>
                      PDFs
                    </button>
                    <span
                      v-else-if="
                        compra.status === 'Aprovado' &&
                        !temIngressosDisponiveis(compra)
                      "
                      class="info-text used-text"
                    >
                      <i class="fa-solid fa-check-circle"></i> Todos usados
                    </span>
                    <span v-else class="info-text">-</span>
                  </td>
                </tr>
                <!-- Detalhes expandidos -->
                <tr v-if="compra.expandido">
                  <td :colspan="10" class="detalhes-cell">
                    <div class="detalhes-container">
                      <div class="detalhes-header">
                        <h4>Ingressos da compra #{{ compra.compra_id }}</h4>
                        <button
                          class="close-details-btn"
                          @click="toggleDetalhes(compra)"
                        >
                          <i class="fa-solid fa-xmark"></i> Fechar
                        </button>
                      </div>
                      <div class="detalhes-list">
                        <div
                          v-for="ticket in compra.tickets"
                          :key="ticket.id"
                          class="detalhe-item"
                        >
                          <div class="detalhe-info">
                            <span class="code-text">{{
                              ticket.codigo_ingresso
                            }}</span>
                            <span v-if="ticket.checkin_em" class="checkin-badge"
                              ><i class="fa-solid fa-check-double"></i>
                              {{ formatDateTime(ticket.checkin_em) }}</span
                            >
                            <span
                              v-if="ticket.mercado_pago_id === 'PRESENCIAL'"
                              class="presencial-badge"
                              >Presencial</span
                            >
                          </div>
                          <div class="detalhe-actions">
                            <button
                              v-if="
                                ticket.status_pagamento === 'Aprovado' &&
                                !ticket.checkin_em
                              "
                              class="action-btn pdf-individual-btn"
                              @click.stop="baixarPDFIndividual(ticket)"
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
                            <span
                              v-else-if="ticket.checkin_em"
                              class="info-text used-text"
                              ><i class="fa-solid fa-check-circle"></i>
                              Usado</span
                            >
                            <span v-else class="info-text">Indisponível</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

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
          <div class="modal-form">
            <div v-if="vendaError" class="modal-error">{{ vendaError }}</div>
            <div class="form-grid">
              <div class="form-row span-2">
                <label>Campeonato *</label
                ><select v-model.number="vendaForm.campeonato_id" required>
                  <option :value="0" disabled>Selecione</option>
                  <option v-for="c in campeonatos" :key="c.id" :value="c.id">
                    {{ c.nome_campeonato }}
                  </option>
                </select>
              </div>
              <div class="form-row">
                <label>Quantidade *</label
                ><input
                  v-model.number="vendaForm.quantidade"
                  type="number"
                  min="1"
                  max="50"
                  required
                />
              </div>
              <div class="form-row">
                <label>Valor unitário *</label
                ><input
                  v-model.number="vendaForm.valor_unitario"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div class="form-row">
                <label>CPF (opcional)</label
                ><input
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
const feedback = ref("");
const feedbackType = ref("success");
const searchType = ref("todos");
const searchQuery = ref("");

const showVendaModal = ref(false);
const vendaLoading = ref(false);
const vendaError = ref("");
const vendaForm = ref({
  campeonato_id: 0,
  quantidade: 1,
  valor_unitario: 0,
  cpf: "",
});

const searchLabel = computed(
  () =>
    ({
      todos: "Buscar",
      nome: "Nome",
      cpf: "CPF",
      compra_id: "ID Compra",
      codigo: "Código",
    })[searchType.value] || "Buscar",
);
const searchPlaceholder = computed(
  () =>
    ({
      todos: "Digite...",
      nome: "Nome completo",
      cpf: "000.000.000-00",
      compra_id: "Número",
      codigo: "TKT-XXXXXXXX",
    })[searchType.value] || "Digite...",
);

// Usando um Map para armazenar o estado de expansão
const expandedCompras = ref(new Map());

const comprasAgrupadas = computed(() => {
  const grupos = new Map();
  tickets.value.forEach((t) => {
    const chave = t.compra_id || t.id;
    if (!grupos.has(chave)) {
      const isPresencial = t.mercado_pago_id === "PRESENCIAL";
      grupos.set(chave, {
        compra_id: chave,
        cliente: t.nome_completo,
        email: t.email,
        cpf: t.cpf,
        campeonato: t.nome_campeonato,
        quantidade: 0,
        valor_total: 0,
        status: t.status_pagamento,
        tipo: isPresencial ? "presencial" : "online",
        checkins: 0,
        tickets: [],
        expandido: expandedCompras.value.get(chave) || false,
      });
    }
    const g = grupos.get(chave);
    g.quantidade += 1;
    g.valor_total += Number(t.total || t.valor_unitario || 0);
    if (t.checkin_em) g.checkins += 1;
    g.tickets.push(t);
  });
  let resultado = Array.from(grupos.values());
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    resultado = resultado.filter((g) => {
      switch (searchType.value) {
        case "nome":
          return (g.cliente || "").toLowerCase().includes(q);
        case "cpf":
          return (g.cpf || "").includes(q.replace(/\D/g, ""));
        case "compra_id":
          return String(g.compra_id) === q;
        default:
          return (
            (g.cliente || "").toLowerCase().includes(q) ||
            (g.cpf || "").includes(q.replace(/\D/g, "")) ||
            String(g.compra_id) === q
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
function limparBusca() {
  searchQuery.value = "";
  searchType.value = "todos";
}
function showMessage(m, t = "success") {
  feedback.value = m;
  feedbackType.value = t;
  setTimeout(() => (feedback.value = ""), 5000);
}

function toggleDetalhes(compra) {
  const currentState = expandedCompras.value.get(compra.compra_id) || false;

  // Fecha todos
  expandedCompras.value.clear();

  // Se não estava aberto, abre este
  if (!currentState) {
    expandedCompras.value.set(compra.compra_id, true);
  }

  // Força a reatividade criando um novo Map
  expandedCompras.value = new Map(expandedCompras.value);
}

function temIngressosDisponiveis(compra) {
  if (!compra || !compra.tickets) return false;

  // Verifica se existe pelo menos um ingresso aprovado e sem check-in
  return compra.tickets.some(
    (ticket) => ticket.status_pagamento === "Aprovado" && !ticket.checkin_em,
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
    const blob = await adminService.vendaPresencialPDF({
      campeonato_id: vendaForm.value.campeonato_id,
      quantidade: vendaForm.value.quantidade,
      valor_unitario: vendaForm.value.valor_unitario,
      cpf: vendaForm.value.cpf || "",
    });
    baixarArquivo(blob, "venda-presencial.pdf");
    showVendaModal.value = false;
    showMessage("✅ Venda realizada! PDF gerado.");
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
    const response = await adminService.getTickets();
    const data = unwrapCollection(response);
    if (Array.isArray(data)) {
      tickets.value = data;
    } else {
      tickets.value = [];
      error.value = "Formato de dados inválido";
    }
  } catch (err) {
    error.value = getApiErrorMessage(err, "Erro ao buscar inscrições.");
    tickets.value = [];
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
  if (!ticket?.id || ticket.checkin_em) return;
  pdfLoading.value[ticket.id] = true;
  try {
    baixarArquivo(
      await adminService.downloadTicketPDF(ticket.id),
      `inscricao-${ticket.codigo_ingresso || ticket.id}.pdf`,
    );
  } catch {
    showMessage("Erro ao baixar PDF.", "error");
  } finally {
    pdfLoading.value[ticket.id] = false;
  }
}

async function baixarPDFsCompra(compra) {
  pdfLoading.value[compra.compra_id] = true;
  try {
    const validos = compra.tickets.filter(
      (t) => t.status_pagamento === "Aprovado" && !t.checkin_em,
    );
    for (const t of validos) {
      try {
        baixarArquivo(
          await adminService.downloadTicketPDF(t.id),
          `inscricao-${t.codigo_ingresso || t.id}.pdf`,
        );
        await new Promise((r) => setTimeout(r, 300));
      } catch {}
    }
  } catch {
    showMessage("Erro ao baixar PDFs.", "error");
  } finally {
    pdfLoading.value[compra.compra_id] = false;
  }
}

async function reimprimirVenda(compraId) {
  try {
    baixarArquivo(
      await adminService.reimprimirVenda(compraId),
      `venda-presencial-${compraId}.pdf`,
    );
    showMessage("✅ PDF reimpresso!");
  } catch {
    showMessage("Erro ao reimprimir.", "error");
  }
}

async function loadCampeonatos() {
  try {
    campeonatos.value = unwrapCollection(await adminService.getCampeonatos());
  } catch {}
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
  flex-shrink: 0;
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
  overflow: hidden;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}
.panel-header h3 {
  font-size: 1.1rem;
  margin: 0;
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
  grid-template-columns: 1fr 1fr;
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
  -webkit-appearance: none;
  appearance: none;
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
  min-width: 800px;
}
th,
td {
  padding: 0.6rem 0.45rem;
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

/* Célula de expansão */
.expand-cell {
  width: 40px;
  text-align: center;
  cursor: pointer;
  user-select: none;
}
.expand-icon {
  font-size: 0.8rem;
  color: var(--text-light);
  transition: transform 0.3s ease;
}
.clickable-row {
  cursor: pointer;
  transition: background 0.15s;
}
.clickable-row:hover {
  background-color: #f0f9ff;
}
.row-expanded {
  background-color: #f0f9ff !important;
}
.clickable-row td {
  cursor: pointer;
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
.qtd-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #475569;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.75rem;
}
.presencial-badge {
  font-size: 0.6rem;
  background: #e0e7ff;
  color: #4338ca;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  font-weight: 600;
  margin-left: 0.3rem;
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

.used-text {
  color: #059669;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.actions-cell {
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
  line-height: 1;
}

.actions-cell * {
  cursor: default;
}
.action-btn {
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
  transition: all 0.2s ease;
}
.pdf-btn {
  background: #dcfce7;
  color: #15803d;
  border-color: rgba(21, 128, 61, 0.2);
}
.pdf-btn:hover:not(:disabled) {
  background: #bbf7d0;
}
.pdf-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  border-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
}
.pdf-individual-btn {
  background: #f0fdf4;
  color: #15803d;
  border-color: rgba(21, 128, 61, 0.15);
  font-size: 0.68rem;
}
.pdf-individual-btn:hover:not(:disabled) {
  background: #dcfce7;
}
.pdf-individual-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  border-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
}
.reprint-btn {
  background: #e0e7ff;
  color: #4338ca;
  border-color: rgba(67, 56, 202, 0.2);
}
.reprint-btn:hover:not(:disabled) {
  background: #c7d2fe;
}
.reprint-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  border-color: #cbd5e1;
  cursor: not-allowed;
  opacity: 0.7;
}
.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
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
  transition: all 0.2s ease;
}
.primary-btn {
  background: var(--primary);
  color: #fff;
}
.primary-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.secondary-btn {
  background: #fff;
  color: var(--text);
  border-color: #cbd5e1;
}
.secondary-btn:hover {
  background: #f8fafc;
}

/* Detalhes expandidos */
.detalhes-cell {
  padding: 0 !important;
  background: #f8fafc;
}
.detalhes-container {
  padding: 1rem;
}
.detalhes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.detalhes-header h4 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text);
}
.close-details-btn {
  background: #e2e8f0;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.close-details-btn:hover {
  background: #cbd5e1;
}
.detalhes-list {
  display: grid;
  gap: 0.35rem;
}
.detalhe-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
}
.detalhe-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.detalhe-actions {
  flex-shrink: 0;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s;
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
  font-size: 1.1rem;
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
  -webkit-appearance: none;
  appearance: none;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (min-width: 769px) {
  .admin-page {
    gap: 1.5rem;
    padding: 1.5rem;
  }
  .page-header {
    padding: 1.5rem;
    border-radius: 24px;
    align-items: center;
  }
  .page-header h2 {
    font-size: 1.7rem;
  }
  .panel {
    padding: 1.5rem;
    border-radius: 24px;
  }
  .modal {
    border-radius: 24px;
    margin: auto;
  }
}
@media (max-width: 480px) {
  .page-header {
    padding: 0.85rem 1rem;
    flex-direction: column;
  }
  .header-actions {
    width: 100%;
  }
  .header-actions button {
    flex: 1;
  }
  .panel {
    padding: 0.85rem;
    border-radius: 16px;
  }
  .search-row {
    grid-template-columns: 1fr;
  }
  .search-actions {
    flex-direction: column;
  }
  .search-actions button {
    width: 100%;
  }
  th:nth-child(3),
  td:nth-child(3),
  th:nth-child(4),
  td:nth-child(4),
  th:nth-child(7),
  td:nth-child(7) {
    display: none;
  }
  .detalhe-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.4rem;
  }
}
</style>
