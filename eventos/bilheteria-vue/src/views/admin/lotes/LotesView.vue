<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Lotes</h2>
        <p>Controle os lotes vinculados a cada campeonato.</p>
      </div>

      <div class="header-actions">
        <button
          type="button"
          class="secondary-btn"
          @click="loadData"
          :disabled="loading"
        >
          Recarregar
        </button>
        <button type="button" class="primary-btn" @click="openCreateForm">
          Novo lote
        </button>
      </div>
    </div>

    <p v-if="feedback" class="alert" :class="feedbackType">{{ feedback }}</p>

    <div class="admin-grid">
      <div class="panel table-panel">
        <div class="panel-header">
          <h3>Lista de Lotes</h3>
          <span class="total-count">{{ lotes.length }} registros</span>
        </div>

        <div v-if="loading" class="state-box">
          <span class="spinner"></span>
          <p>Carregando lotes...</p>
        </div>

        <div v-else-if="error" class="state-box error">
          <p>{{ error }}</p>
          <button class="secondary-btn" type="button" @click="loadData">
            Tentar novamente
          </button>
        </div>

        <div v-else-if="!lotes.length" class="state-box">
          <p>Nenhum lote cadastrado.</p>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Nome</th>
                <th>Campeonato</th>
                <th>Quantidade</th>
                <th>Vendidos</th>
                <th>Status</th>
                <th class="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lotesOrdenados" :key="item.id">
                <td>
                  <strong>#{{ item.numero_lote }}</strong>
                </td>
                <td>
                  <div class="lot-name">
                    <span class="name-text">{{ item.nome_lote }}</span>
                  </div>
                </td>
                <td>{{ campeonatoName(item.campeonato_id) }}</td>
                <td>{{ item.quantidade_total }}</td>
                <td>{{ item.quantidade_vendida || 0 }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="getStatusClass(item.status)"
                    >{{ item.status || "ativo" }}</span
                  >
                </td>
                <td class="actions-cell">
                  <button
                    type="button"
                    class="action-btn edit-btn"
                    @click="openEditForm(item)"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                      />
                      <path
                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                      />
                    </svg>
                    Editar
                  </button>
                  <button
                    type="button"
                    class="action-btn delete-btn"
                    @click="handleDelete(item)"
                    :disabled="deletingId === item.id"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M3 6h18" />
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      />
                    </svg>
                    {{ deletingId === item.id ? "Excluindo..." : "Excluir" }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="cancelForm">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingId ? "Editar Lote" : "Novo Lote" }}</h3>
          <button type="button" class="modal-close" @click="cancelForm">
            ✕
          </button>
        </div>

        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Exibe erros do formulário dentro do modal -->
          <div v-if="formError" class="form-error">
            <div class="error-icon">⚠️</div>
            <div class="error-content">
              <strong>Erro ao salvar</strong>
              <p>{{ formError }}</p>
              <button
                v-if="formError.includes('Capacidade total')"
                type="button"
                class="error-hint"
                @click="showErrorHint = !showErrorHint"
              >
                💡 Ver dica
              </button>
              <div
                v-if="showErrorHint && formError.includes('Capacidade total')"
                class="error-hint-detail"
              >
                A quantidade total do lote deve ser maior ou igual à soma das
                quantidades dos tipos de inscrição já cadastrados para este
                lote.
              </div>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-row span-2">
              <label>
                Campeonato *
                <select v-model.number="form.campeonato_id" required>
                  <option :value="0" disabled>Selecione um campeonato</option>
                  <option
                    v-for="item in campeonatos"
                    :key="item.id"
                    :value="Number(item.id)"
                  >
                    {{ item.nome_campeonato }}
                  </option>
                </select>
              </label>
            </div>

            <div class="form-row">
              <label>
                Número do lote *
                <input
                  v-model.number="form.numero_lote"
                  type="number"
                  min="1"
                  required
                />
                <small>Identificador único do lote</small>
              </label>
            </div>

            <div class="form-row span-2">
              <label>
                Nome do lote *
                <input
                  v-model.trim="form.nome_lote"
                  type="text"
                  required
                  placeholder="Ex: Lote Premium"
                />
              </label>
            </div>

            <div class="form-row">
              <label>
                Início das vendas *
                <input v-model="form.data_inicio_vendas" type="date" required />
              </label>
            </div>

            <div class="form-row">
              <label>
                Fim das vendas *
                <input v-model="form.data_fim_vendas" type="date" required />
              </label>
            </div>

            <div class="form-row">
              <label>
                Quantidade total *
                <input
                  v-model.number="form.quantidade_total"
                  type="number"
                  min="1"
                  required
                  placeholder="Ex: 100"
                />
              </label>
            </div>

            <div class="form-row" v-if="editingId">
              <label>
                Status
                <select v-model="form.status" required>
                  <option value="ativo">Ativo</option>
                  <option value="esgotado">Esgotado</option>
                  <option value="encerrado">Encerrado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button class="secondary-btn" type="button" @click="cancelForm">
              Cancelar
            </button>
            <button
              class="primary-btn"
              type="submit"
              :disabled="saving || !canSubmit"
            >
              {{ saving ? "Salvando..." : editingId ? "Atualizar" : "Criar" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { adminService } from "@/services/api";
import {
  getApiErrorMessage,
  unwrapCollection,
  unwrapItem,
} from "@/utils/adminHelpers";

const lotes = ref([]);
const campeonatos = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const error = ref("");
const feedback = ref("");
const feedbackType = ref("success");
const showForm = ref(false);
const editingId = ref(null);
const formError = ref("");
const showErrorHint = ref(false);

const emptyForm = () => ({
  campeonato_id: 0,
  numero_lote: 1,
  nome_lote: "",
  data_inicio_vendas: "",
  data_fim_vendas: "",
  quantidade_total: 1,
  status: "ativo",
});

const form = reactive(emptyForm());

// Lotes ordenados por ordem (se existir)
const lotesOrdenados = computed(() => {
  return [...lotes.value].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
});

const canSubmit = computed(() => {
  return Boolean(
    form.campeonato_id &&
    form.numero_lote > 0 &&
    form.nome_lote.trim() &&
    form.data_inicio_vendas &&
    form.data_fim_vendas &&
    form.quantidade_total > 0,
  );
});

function resetForm() {
  Object.assign(form, emptyForm());
  editingId.value = null;
  formError.value = "";
  showErrorHint.value = false;
}

function getStatusClass(status) {
  const classes = {
    ativo: "status-active",
    esgotado: "status-soldout",
    encerrado: "status-finished",
    cancelado: "status-canceled",
  };
  return classes[status?.toLowerCase()] || "status-active";
}

function openCreateForm() {
  resetForm();
  showForm.value = true;
  // Se tiver campeonatos, seleciona o primeiro
  if (campeonatos.value.length > 0) {
    form.campeonato_id = Number(campeonatos.value[0].id);
  }
}

function openEditForm(item) {
  const data = unwrapItem(item) || item;
  resetForm();
  Object.assign(form, emptyForm(), {
    ...data,
    campeonato_id: Number(data?.campeonato_id || 0),
    numero_lote: Number(data?.numero_lote || 1),
    data_inicio_vendas: data?.data_inicio_vendas
      ? String(data.data_inicio_vendas).slice(0, 10)
      : "",
    data_fim_vendas: data?.data_fim_vendas
      ? String(data.data_fim_vendas).slice(0, 10)
      : "",
    quantidade_total: Number(data?.quantidade_total || 1),
    status: data?.status?.toLowerCase() || "ativo",
  });
  editingId.value = data.id;
  showForm.value = true;
  formError.value = "";
}

function cancelForm() {
  showForm.value = false;
  feedback.value = "";
  resetForm();
}

function showMessage(message, type = "success") {
  feedback.value = message;
  feedbackType.value = type;
}

function campeonatoName(campeonatoId) {
  if (!campeonatos.value.length) return "Carregando...";
  const match = campeonatos.value.find(
    (item) => Number(item.id) === Number(campeonatoId),
  );
  return match?.nome_campeonato || "Campeonato não encontrado";
}

// Função para converter data para formato ISO completo
function formatDateToISO(dateStr) {
  if (!dateStr) return "";
  return `${dateStr}T00:00:00`;
}

// Função para extrair mensagem de erro da API
function extractErrorMessage(err) {
  if (!err.response || !err.response.data) {
    return "Não foi possível salvar o lote. Verifique sua conexão.";
  }

  const data = err.response.data;

  // Se for um objeto com detail
  if (data.detail) {
    return data.detail;
  }

  // Se for um objeto com message
  if (data.message) {
    return data.message;
  }

  // Se for uma string
  if (typeof data === "string") {
    return data;
  }

  // Se tiver errors (validação de campos)
  if (data.errors) {
    const errorMessages = Object.values(data.errors).flat();
    return errorMessages.join(". ");
  }

  // Fallback
  return JSON.stringify(data);
}

async function loadData() {
  loading.value = true;
  error.value = "";

  try {
    console.log("Carregando dados...");

    const [campeonatosResponse, lotesResponse] = await Promise.all([
      adminService.getCampeonatos(),
      adminService.getLotes(),
    ]);

    console.log("Resposta campeonatos:", campeonatosResponse);
    console.log("Resposta lotes:", lotesResponse);

    // Extrai os dados corretamente da resposta da API
    let campeonatosData = [];
    let lotesData = [];

    if (
      campeonatosResponse &&
      campeonatosResponse.data &&
      Array.isArray(campeonatosResponse.data)
    ) {
      campeonatosData = campeonatosResponse.data;
    } else if (Array.isArray(campeonatosResponse)) {
      campeonatosData = campeonatosResponse;
    } else {
      campeonatosData = unwrapCollection(campeonatosResponse) || [];
    }

    if (
      lotesResponse &&
      lotesResponse.data &&
      Array.isArray(lotesResponse.data)
    ) {
      lotesData = lotesResponse.data;
    } else if (Array.isArray(lotesResponse)) {
      lotesData = lotesResponse;
    } else {
      lotesData = unwrapCollection(lotesResponse) || [];
    }

    console.log("Campeonatos extraídos:", campeonatosData);
    console.log("Lotes extraídos:", lotesData);

    campeonatos.value = campeonatosData;
    lotes.value = lotesData;

    if (!campeonatosData.length) {
      console.warn("Nenhum campeonato encontrado!");
    }
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    error.value = getApiErrorMessage(
      err,
      "Não foi possível carregar os dados.",
    );
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!canSubmit.value || saving.value) {
    return;
  }

  saving.value = true;
  formError.value = "";

  try {
    // Formata as datas para ISO (formato que a API espera)
    const dataInicioVendas = form.data_inicio_vendas
      ? new Date(form.data_inicio_vendas).toISOString()
      : null;
    const dataFimVendas = form.data_fim_vendas
      ? new Date(form.data_fim_vendas).toISOString()
      : null;

    if (editingId.value) {
      // Para UPDATE - enviar apenas os campos do LoteUpdate
      const payload = {};

      // Adiciona apenas campos que foram preenchidos
      if (form.nome_lote && form.nome_lote.trim()) {
        payload.nome_lote = form.nome_lote.trim();
      }

      if (dataInicioVendas) {
        payload.data_inicio_vendas = dataInicioVendas;
      }

      if (dataFimVendas) {
        payload.data_fim_vendas = dataFimVendas;
      }

      if (form.quantidade_total && form.quantidade_total > 0) {
        payload.quantidade_total = Number(form.quantidade_total);
      }

      if (form.status) {
        payload.status = form.status.toLowerCase();
      }

      console.log("Payload para update:", payload);
      await adminService.updateLote(editingId.value, payload);
      showMessage("Lote atualizado com sucesso.");

      showForm.value = false;
      resetForm();
      await loadData();
    } else {
      // Para CREATE - enviar todos os campos obrigatórios
      const payload = {
        campeonato_id: Number(form.campeonato_id),
        numero_lote: Number(form.numero_lote),
        nome_lote: form.nome_lote.trim(),
        data_inicio_vendas: dataInicioVendas,
        data_fim_vendas: dataFimVendas,
        quantidade_total: Number(form.quantidade_total),
      };

      console.log("Payload para create:", payload);
      await adminService.createLote(payload);
      showMessage("Lote criado com sucesso.");

      showForm.value = false;
      resetForm();
      await loadData();
    }
  } catch (err) {
    console.error("Erro ao salvar lote:", err);

    // Extrai a mensagem de erro da resposta
    const errorMessage = extractErrorMessage(err);

    // Define o erro no formulário (dentro do modal)
    formError.value = errorMessage;

    // Se for erro de capacidade, mostra a dica automaticamente
    if (
      errorMessage.includes("Capacidade total") ||
      errorMessage.includes("soma das quantidades")
    ) {
      showErrorHint.value = true;
    }
  } finally {
    saving.value = false;
  }
}

async function handleDelete(item) {
  const data = unwrapItem(item) || item;
  const confirmed = window.confirm(`Excluir o lote "${data.nome_lote}"?`);

  if (!confirmed) {
    return;
  }

  deletingId.value = data.id;

  try {
    await adminService.deleteLote(data.id);
    showMessage("Lote excluído com sucesso.");
    await loadData();
  } catch (err) {
    console.error("Erro ao excluir lote:", err);
    const errorMessage = extractErrorMessage(err);
    showMessage(errorMessage, "error");
  } finally {
    deletingId.value = null;
  }
}

onMounted(() => {
  console.log("Componente montado, carregando dados...");
  loadData();
});
</script>

<style scoped>
/* ============================================ */
/* GERAL */
/* ============================================ */
.admin-page {
  display: grid;
  gap: 1rem;
  padding: 0.75rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* ============================================ */
/* PAGE HEADER */
/* ============================================ */
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
  flex-wrap: wrap;
  flex-shrink: 0;
}

/* ============================================ */
/* ALERT */
/* ============================================ */
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

/* ============================================ */
/* GRID & PANEL */
/* ============================================ */
.admin-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
.panel {
  background: var(--card);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1rem 1.25rem;
  overflow: hidden;
}
.table-panel {
  display: flex;
  flex-direction: column;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
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
  white-space: nowrap;
}

/* ============================================ */
/* TABELA */
/* ============================================ */
.table-wrap {
  overflow-x: auto;
  margin: 0 -0.25rem;
  padding: 0 0.25rem;
  flex: 1;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 650px;
}
th,
td {
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}
th {
  color: var(--text-light);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
  padding-top: 0;
  white-space: nowrap;
}
tbody tr {
  transition: background-color 0.2s ease;
}
tbody tr:hover {
  background-color: #f8fafc;
}
tbody tr:last-child td {
  border-bottom: none;
}

.lot-name {
  display: flex;
  flex-direction: column;
}
.name-text {
  font-weight: 500;
  color: var(--text);
  font-size: 0.85rem;
}

/* ============================================ */
/* AÇÕES */
/* ============================================ */
.actions-header {
  text-align: center;
}
.actions-cell {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  align-items: center;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 600;
  font-size: 0.72rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--text-light);
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}
.action-btn svg {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
}
.edit-btn {
  color: var(--primary);
  border-color: rgba(230, 33, 23, 0.2);
}
.edit-btn:active {
  background: rgba(230, 33, 23, 0.05);
  border-color: var(--primary);
}
.delete-btn {
  color: #b91c1c;
  border-color: rgba(185, 28, 28, 0.2);
}
.delete-btn:active {
  background: rgba(185, 28, 28, 0.05);
  border-color: #b91c1c;
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================ */
/* STATUS BADGE */
/* ============================================ */
.status-badge {
  display: inline-flex;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: capitalize;
  white-space: nowrap;
}
.status-active {
  background: #dbeafe;
  color: #1e40af;
}
.status-soldout {
  background: #fee2e2;
  color: #991b1b;
}
.status-finished {
  background: #f3f4f6;
  color: #6b7280;
}
.status-canceled {
  background: #fef2f2;
  color: #dc2626;
}

/* ============================================ */
/* BOTÕES */
/* ============================================ */
.primary-btn,
.secondary-btn {
  border-radius: 12px;
  border: 1px solid transparent;
  padding: 0.65rem 1rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}
.primary-btn {
  background: var(--primary);
  color: #fff;
}
.primary-btn:active {
  background: #c81e14;
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
.secondary-btn:active {
  background: #f8fafc;
}

/* ============================================ */
/* STATE BOX */
/* ============================================ */
.state-box {
  min-height: 200px;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.5rem;
  color: var(--text-light);
  font-size: 0.9rem;
  padding: 2rem 1rem;
}
.state-box.error {
  color: #b91c1c;
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

/* ============================================ */
/* FORM ERROR */
/* ============================================ */
.form-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  font-size: 0.8rem;
}
.error-icon {
  flex-shrink: 0;
}
.error-content strong {
  display: block;
  color: #991b1b;
  font-size: 0.85rem;
}
.error-content p {
  color: #7f1d1d;
  font-size: 0.8rem;
  margin: 0.25rem 0 0;
}
.error-hint {
  background: transparent;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0;
  font-size: 0.8rem;
}
.error-hint-detail {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 0.65rem;
  margin-top: 0.5rem;
  color: #1e40af;
  font-size: 0.8rem;
}

/* ============================================ */
/* MODAL */
/* ============================================ */
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
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: var(--card);
  border-radius: 20px 20px 0 0;
  z-index: 1;
}
.modal-header h3 {
  font-size: 1.15rem;
  margin: 0;
}
.modal-close {
  background: #f1f5f9;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  -webkit-tap-highlight-color: transparent;
}
.modal-close:active {
  background: #e2e8f0;
}

.modal-form {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
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

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 700;
  color: var(--text);
  font-size: 0.8rem;
}
label small {
  font-weight: 400;
  color: var(--text-light);
  font-size: 0.7rem;
}
input,
select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font: inherit;
  font-size: 0.85rem;
  background: #fff;
  transition: all 0.2s ease;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
input:focus,
select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 33, 23, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  margin-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}
.modal-actions button {
  flex: 1;
}

/* ============================================ */
/* ANIMAÇÕES */
/* ============================================ */
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

/* ============================================ */
/* TABLET+ */
/* ============================================ */
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
  .header-actions {
    gap: 0.75rem;
  }
  .panel {
    padding: 1.5rem;
    border-radius: 24px;
  }
  .panel-header h3 {
    font-size: 1.3rem;
  }
  th {
    font-size: 0.8rem;
  }
  td {
    padding: 1rem 0.75rem;
  }
  .action-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  .action-btn svg {
    width: 16px;
    height: 16px;
  }
  .name-text {
    font-size: 0.95rem;
  }
  .status-badge {
    font-size: 0.8rem;
    padding: 0.35rem 0.8rem;
  }
  .primary-btn,
  .secondary-btn {
    font-size: 0.9rem;
    padding: 0.75rem 1.25rem;
    border-radius: 14px;
  }

  .modal {
    border-radius: 24px;
    margin: auto;
    max-height: 85vh;
  }
  .modal-header {
    padding: 1.5rem 2rem;
    border-radius: 24px 24px 0 0;
  }
  .modal-header h3 {
    font-size: 1.4rem;
  }
  .modal-form {
    padding: 2rem;
  }
  .form-grid {
    gap: 1rem;
  }
  input,
  select {
    padding: 0.75rem 0.9rem;
    font-size: 0.9rem;
  }
  .modal-actions {
    gap: 0.75rem;
    padding-top: 1.5rem;
  }
  .modal-actions button {
    flex: 0;
  }
  .state-box {
    min-height: 280px;
  }
  .spinner {
    width: 2rem;
    height: 2rem;
  }
}

/* ============================================ */
/* MOBILE PEQUENO */
/* ============================================ */
@media (max-width: 480px) {
  .page-header {
    padding: 0.85rem 1rem;
  }
  .page-header h2 {
    font-size: 1.15rem;
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
  .form-grid,
  .form-row.span-2 {
    grid-template-columns: 1fr;
    grid-column: auto;
  }
  .actions-cell {
    flex-direction: column;
  }
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  th:nth-child(3),
  td:nth-child(3),
  th:nth-child(4),
  td:nth-child(4) {
    display: none;
  }
  table {
    min-width: auto;
  }
}
</style>
