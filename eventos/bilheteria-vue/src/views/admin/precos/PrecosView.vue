<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Preços</h2>
        <p>Configure preços por campeonato, lote e tipo de inscrição.</p>
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
          Novo preço
        </button>
      </div>
    </div>

    <p v-if="feedback" class="alert" :class="feedbackType">{{ feedback }}</p>

    <div class="admin-grid">
      <div class="panel table-panel">
        <div class="panel-header">
          <h3>Lista de Preços</h3>
          <span class="total-count">{{ precos.length }} registros</span>
        </div>

        <div v-if="loading" class="state-box">
          <span class="spinner"></span>
          <p>Carregando preços...</p>
        </div>

        <div v-else-if="error" class="state-box error">
          <p>{{ error }}</p>
          <button class="secondary-btn" type="button" @click="loadData">
            Tentar novamente
          </button>
        </div>

        <div v-else-if="!precos.length" class="state-box">
          <p>Nenhum preço cadastrado.</p>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campeonato</th>
                <th>Lote</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Disponível</th>
                <th>Status</th>
                <th class="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in precos" :key="item.id">
                <td>
                  <div class="info-cell">
                    <span class="info-main">{{
                      campeonatoName(resolveCampeonatoId(item))
                    }}</span>
                  </div>
                </td>
                <td>
                  <span class="info-text">{{ loteName(item.lote_id) }}</span>
                </td>
                <td>
                  <span class="info-text">{{
                    tipoName(item.tipo_inscricao_id)
                  }}</span>
                </td>
                <td>
                  <span class="price-text">{{
                    formatCurrencyBR(item.preco)
                  }}</span>
                </td>
                <td>
                  <span class="info-text">{{
                    item.quantidade_disponivel
                  }}</span>
                </td>
                <td>
                  <span
                    class="status-badge"
                    :class="getStatusClass(item.status)"
                  >
                    {{ item.status || "ativo" }}
                  </span>
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
          <h3>{{ editingId ? "Editar Preço" : "Novo Preço" }}</h3>
          <button type="button" class="modal-close" @click="cancelForm">
            ✕
          </button>
        </div>

        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Erro dentro do modal -->
          <div v-if="modalError" class="modal-error">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{{ modalError }}</span>
          </div>

          <div class="form-grid">
            <div class="form-row span-2">
              <label>
                Campeonato *
                <select
                  v-model.number="form.campeonato_id"
                  required
                  @change="handleCampeonatoChange"
                >
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
                Lote *
                <select
                  v-model.number="form.lote_id"
                  required
                  :disabled="!filteredLotes.length"
                >
                  <option :value="0" disabled>Selecione um lote</option>
                  <option
                    v-for="item in filteredLotes"
                    :key="item.id"
                    :value="Number(item.id)"
                  >
                    {{ item.nome_lote }}
                  </option>
                </select>
              </label>
            </div>

            <div class="form-row">
              <label>
                Tipo de inscrição *
                <select
                  v-model.number="form.tipo_inscricao_id"
                  required
                  :disabled="!filteredTipos.length"
                >
                  <option :value="0" disabled>Selecione um tipo</option>
                  <option
                    v-for="item in filteredTipos"
                    :key="item.id"
                    :value="Number(item.id)"
                  >
                    {{ item.nome_tipo }}
                  </option>
                </select>
              </label>
            </div>

            <div class="form-row">
              <label>
                Preço (R$) *
                <input
                  v-model.number="form.preco"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0,00"
                />
              </label>
            </div>

            <div class="form-row">
              <label>
                Quantidade disponível *
                <input
                  v-model.number="form.quantidade_disponivel"
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                />
              </label>
            </div>

            <div class="form-row" v-if="editingId">
              <label>
                Status
                <select v-model="form.status" required>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="esgotado">Esgotado</option>
                  <option value="encerrado">Encerrado</option>
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
              :disabled="!canSubmit || saving"
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
import { computed, onMounted, reactive, ref, watch } from "vue";
import { adminService } from "@/services/api";
import {
  formatCurrencyBR,
  getApiErrorMessage,
  unwrapCollection,
  unwrapItem,
} from "@/utils/adminHelpers";

const precos = ref([]);
const campeonatos = ref([]);
const lotes = ref([]);
const tipos = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const error = ref("");
const feedback = ref("");
const feedbackType = ref("success");
const showForm = ref(false);
const editingId = ref(null);
const modalError = ref("");

const emptyForm = () => ({
  campeonato_id: 0,
  lote_id: 0,
  tipo_inscricao_id: 0,
  preco: 0,
  quantidade_disponivel: 0,
  status: "ativo",
});

const form = reactive(emptyForm());

const selectedCampeonatoId = computed(() => Number(form.campeonato_id || 0));

const filteredLotes = computed(() => {
  if (!selectedCampeonatoId.value) return [];
  return lotes.value.filter(
    (item) => Number(item.campeonato_id) === selectedCampeonatoId.value,
  );
});

const filteredTipos = computed(() => {
  if (!selectedCampeonatoId.value) return [];
  return tipos.value.filter(
    (item) => Number(item.campeonato_id) === selectedCampeonatoId.value,
  );
});

const canSubmit = computed(() => {
  return Boolean(
    form.campeonato_id &&
    form.lote_id &&
    form.tipo_inscricao_id &&
    Number(form.preco) >= 0 &&
    Number(form.quantidade_disponivel) >= 0,
  );
});

function resetForm() {
  Object.assign(form, emptyForm());
  editingId.value = null;
  modalError.value = "";
}

function openCreateForm() {
  resetForm();
  showForm.value = true;
}

function resolveCampeonatoId(item) {
  const lote = lotes.value.find(
    (entry) => Number(entry.id) === Number(item?.lote_id),
  );
  const tipo = tipos.value.find(
    (entry) => Number(entry.id) === Number(item?.tipo_inscricao_id),
  );
  return Number(
    item?.campeonato_id || lote?.campeonato_id || tipo?.campeonato_id || 0,
  );
}

function openEditForm(item) {
  const data = unwrapItem(item) || item;
  const campeonatoId = resolveCampeonatoId(data);

  Object.assign(form, emptyForm(), {
    ...data,
    campeonato_id: campeonatoId,
    lote_id: Number(data?.lote_id || 0),
    tipo_inscricao_id: Number(data?.tipo_inscricao_id || 0),
    preco: Number(data?.preco || 0),
    quantidade_disponivel: Number(data?.quantidade_disponivel || 0),
    status: data?.status || "ativo",
  });

  editingId.value = data.id;
  modalError.value = "";
  showForm.value = true;
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
  const match = campeonatos.value.find(
    (item) => Number(item.id) === Number(campeonatoId),
  );
  return match?.nome_campeonato || "-";
}

function loteName(loteId) {
  const match = lotes.value.find((item) => Number(item.id) === Number(loteId));
  return match?.nome_lote || "-";
}

function tipoName(tipoId) {
  const match = tipos.value.find((item) => Number(item.id) === Number(tipoId));
  return match?.nome_tipo || "-";
}

function getStatusClass(status) {
  const statusMap = {
    ativo: "status-active",
    inativo: "status-inactive",
    esgotado: "status-soldout",
    encerrado: "status-finished",
  };
  return statusMap[status?.toLowerCase()] || "status-active";
}

function handleCampeonatoChange() {
  form.lote_id = 0;
  form.tipo_inscricao_id = 0;
}

async function loadData() {
  loading.value = true;
  error.value = "";

  try {
    const [campeonatosResponse, lotesResponse, tiposResponse, precosResponse] =
      await Promise.all([
        adminService.getCampeonatos(),
        adminService.getLotes(),
        adminService.getTiposInscricao(),
        adminService.getPrecos(),
      ]);

    campeonatos.value = unwrapCollection(campeonatosResponse);
    lotes.value = unwrapCollection(lotesResponse);
    tipos.value = unwrapCollection(tiposResponse);
    precos.value = unwrapCollection(precosResponse);
  } catch (err) {
    error.value = getApiErrorMessage(
      err,
      "Não foi possível carregar os preços.",
    );
  } finally {
    loading.value = false;
  }
}

watch(selectedCampeonatoId, (value, previousValue) => {
  if (previousValue && value !== previousValue) {
    form.lote_id = 0;
    form.tipo_inscricao_id = 0;
  }
});

async function handleSubmit() {
  if (!canSubmit.value || saving.value) return;

  saving.value = true;
  modalError.value = "";

  const payload = {
    lote_id: Number(form.lote_id),
    tipo_inscricao_id: Number(form.tipo_inscricao_id),
    preco: Number(form.preco),
    quantidade_disponivel: Number(form.quantidade_disponivel),
  };

  if (editingId.value) {
    payload.status = form.status || "ativo";
  }

  try {
    if (editingId.value) {
      await adminService.updatePreco(editingId.value, payload);
      showMessage("Preço atualizado com sucesso.");
    } else {
      await adminService.createPreco(payload);
      showMessage("Preço criado com sucesso.");
    }

    showForm.value = false;
    resetForm();
    await loadData();
  } catch (err) {
    modalError.value = getApiErrorMessage(
      err,
      "Não foi possível salvar o preço.",
    );
  } finally {
    saving.value = false;
  }
}

async function handleDelete(item) {
  const data = unwrapItem(item) || item;
  const confirmed = window.confirm("Excluir este preço?");

  if (!confirmed) return;

  deletingId.value = data.id;

  try {
    await adminService.deletePreco(data.id);
    showMessage("Preço excluído com sucesso.");
    await loadData();
  } catch (err) {
    showMessage(
      getApiErrorMessage(err, "Não foi possível excluir o preço."),
      "error",
    );
  } finally {
    deletingId.value = null;
  }
}

onMounted(loadData);
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

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.info-main {
  font-weight: 600;
  color: var(--text);
  font-size: 0.85rem;
}
.info-text {
  font-weight: 500;
  color: var(--text);
  font-size: 0.85rem;
}
.price-text {
  font-weight: 700;
  color: var(--primary);
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
  background: transparent;
}
.edit-btn:active {
  background: rgba(230, 33, 23, 0.05);
  border-color: var(--primary);
}
.delete-btn {
  color: #b91c1c;
  border-color: rgba(185, 28, 28, 0.2);
  background: transparent;
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
  background: #dcfce7;
  color: #15803d;
}
.status-inactive {
  background: #f1f5f9;
  color: #64748b;
}
.status-soldout {
  background: #fee2e2;
  color: #dc2626;
}
.status-finished {
  background: #dbeafe;
  color: #1d4ed8;
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
  max-width: 500px;
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

.modal-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.8rem;
}
.modal-error svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
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
  .info-main,
  .info-text,
  .price-text {
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
  th:nth-child(1),
  td:nth-child(1),
  th:nth-child(5),
  td:nth-child(5) {
    display: none;
  }
  table {
    min-width: auto;
  }
}
</style>
