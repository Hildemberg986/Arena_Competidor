<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Tipos de inscrição</h2>
        <p>Gerencie os tipos disponíveis por campeonato.</p>
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
          Novo tipo
        </button>
      </div>
    </div>

    <p v-if="feedback" class="alert" :class="feedbackType">{{ feedback }}</p>

    <div class="admin-grid">
      <div class="panel table-panel">
        <div class="panel-header">
          <h3>Lista de Tipos de Inscrição</h3>
          <span class="total-count">{{ tipos.length }} registros</span>
        </div>

        <div v-if="loading" class="state-box">
          <span class="spinner"></span>
          <p>Carregando tipos...</p>
        </div>

        <div v-else-if="error" class="state-box error">
          <p>{{ error }}</p>
          <button class="secondary-btn" type="button" @click="loadData">
            Tentar novamente
          </button>
        </div>

        <div v-else-if="!tipos.length" class="state-box">
          <p>Nenhum tipo cadastrado.</p>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Campeonato</th>
                <th>Máx. por pessoa</th>
                <th>Comprovante</th>
                <th class="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in tipos" :key="item.id">
                <td>
                  <div class="info-cell">
                    <span class="info-main">{{ item.nome_tipo }}</span>
                    <span v-if="item.descricao" class="info-sub">{{
                      item.descricao
                    }}</span>
                  </div>
                </td>
                <td>
                  <span class="info-text">{{
                    campeonatoName(item.campeonato_id)
                  }}</span>
                </td>
                <td>
                  <span class="info-text">{{ item.max_por_pessoa }}</span>
                </td>
                <td>
                  <span
                    class="status-badge"
                    :class="
                      isRequerComprovante(item.requer_comprovante)
                        ? 'status-yes'
                        : 'status-no'
                    "
                  >
                    {{
                      isRequerComprovante(item.requer_comprovante)
                        ? "Sim"
                        : "Não"
                    }}
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
          <h3>
            {{
              editingId ? "Editar Tipo de Inscrição" : "Novo Tipo de Inscrição"
            }}
          </h3>
          <button type="button" class="modal-close" @click="cancelForm">
            ✕
          </button>
        </div>

        <form class="modal-form" @submit.prevent="handleSubmit">
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

            <div class="form-row span-2">
              <label>
                Nome do tipo *
                <input
                  v-model.trim="form.nome_tipo"
                  type="text"
                  required
                  placeholder="Ex: Atleta, Técnico, Staff"
                />
              </label>
            </div>

            <div class="form-row span-2">
              <label>
                Descrição
                <textarea
                  v-model.trim="form.descricao"
                  rows="3"
                  placeholder="Descreva o tipo de inscrição..."
                ></textarea>
              </label>
            </div>

            <div class="form-row">
              <label>
                Máximo por pessoa *
                <input
                  v-model.number="form.max_por_pessoa"
                  type="number"
                  min="1"
                  required
                  placeholder="5"
                />
              </label>
            </div>

            <div class="form-row">
              <label class="checkbox-label">
                <input
                  v-model="form.requer_comprovante"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span>Requer comprovante</span>
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
import { computed, onMounted, reactive, ref } from "vue";
import { adminService } from "@/services/api";
import {
  getApiErrorMessage,
  unwrapCollection,
  unwrapItem,
} from "@/utils/adminHelpers";

const tipos = ref([]);
const campeonatos = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const error = ref("");
const feedback = ref("");
const feedbackType = ref("success");
const showForm = ref(false);
const editingId = ref(null);

const emptyForm = () => ({
  campeonato_id: 0,
  nome_tipo: "",
  descricao: "",
  requer_comprovante: false,
  max_por_pessoa: 5,
});

const form = reactive(emptyForm());

const canSubmit = computed(() => {
  return Boolean(
    form.campeonato_id &&
    form.nome_tipo.trim() &&
    Number(form.max_por_pessoa) > 0,
  );
});

function isRequerComprovante(value) {
  return String(value).toUpperCase() === "TRUE";
}

function resetForm() {
  Object.assign(form, emptyForm());
  editingId.value = null;
}

function openCreateForm() {
  resetForm();
  showForm.value = true;
}

function openEditForm(item) {
  const data = unwrapItem(item) || item;
  Object.assign(form, emptyForm(), {
    ...data,
    campeonato_id: Number(data?.campeonato_id || 0),
    requer_comprovante: isRequerComprovante(data?.requer_comprovante),
    max_por_pessoa: Number(data?.max_por_pessoa || 5),
  });
  editingId.value = data.id;
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

async function loadData() {
  loading.value = true;
  error.value = "";

  try {
    const [campeonatosResponse, tiposResponse] = await Promise.all([
      adminService.getCampeonatos(),
      adminService.getTiposInscricao(),
    ]);

    campeonatos.value = unwrapCollection(campeonatosResponse);
    tipos.value = unwrapCollection(tiposResponse);
  } catch (err) {
    error.value = getApiErrorMessage(
      err,
      "Não foi possível carregar os tipos de inscrição.",
    );
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!canSubmit.value || saving.value) return;

  saving.value = true;
  error.value = "";

  const payload = {
    campeonato_id: Number(form.campeonato_id),
    nome_tipo: form.nome_tipo.trim(),
    descricao: form.descricao.trim(),
    requer_comprovante: Boolean(form.requer_comprovante),
    max_por_pessoa: Number(form.max_por_pessoa),
  };

  try {
    if (editingId.value) {
      await adminService.updateTipoInscricao(editingId.value, payload);
      showMessage("Tipo atualizado com sucesso.");
    } else {
      await adminService.createTipoInscricao(payload);
      showMessage("Tipo criado com sucesso.");
    }

    showForm.value = false;
    resetForm();
    await loadData();
  } catch (err) {
    showMessage(
      getApiErrorMessage(err, "Não foi possível salvar o tipo de inscrição."),
      "error",
    );
  } finally {
    saving.value = false;
  }
}

async function handleDelete(item) {
  const data = unwrapItem(item) || item;
  const confirmed = window.confirm(`Excluir o tipo "${data.nome_tipo}"?`);

  if (!confirmed) return;

  deletingId.value = data.id;

  try {
    await adminService.deleteTipoInscricao(data.id);
    showMessage("Tipo excluído com sucesso.");
    await loadData();
  } catch (err) {
    showMessage(
      getApiErrorMessage(err, "Não foi possível excluir o tipo de inscrição."),
      "error",
    );
  } finally {
    deletingId.value = null;
  }
}

onMounted(loadData);
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  padding: 1.5rem;
  background: var(--card);
  border-radius: 24px;
  box-shadow: var(--shadow);
}

.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.page-header h2 {
  margin-top: 0.3rem;
  font-size: 1.7rem;
}

.page-header p {
  color: var(--text-light);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.admin-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: start;
}

.panel {
  background: var(--card);
  border-radius: 24px;
  box-shadow: var(--shadow);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.table-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.panel-header h3 {
  font-size: 1.3rem;
  margin: 0;
}

.total-count {
  font-size: 0.85rem;
  color: var(--text-light);
  background: #f1f5f9;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-weight: 600;
}

.table-wrap {
  overflow-x: auto;
  margin: 0 -0.5rem;
  padding: 0 0.5rem;
  flex: 1;
  min-height: 0;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 800px;
}

th,
td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}

th {
  color: var(--text-light);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
  padding-top: 0;
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
  gap: 0.2rem;
}

.info-main {
  font-weight: 600;
  color: var(--text);
}

.info-sub {
  font-size: 0.8rem;
  color: var(--text-light);
}

.info-text {
  font-weight: 500;
  color: var(--text);
}

.actions-header {
  text-align: center;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--text-light);
}

.action-btn svg {
  flex-shrink: 0;
}

.edit-btn {
  color: var(--primary);
  border-color: rgba(230, 33, 23, 0.2);
}

.edit-btn:hover:not(:disabled) {
  background: rgba(230, 33, 23, 0.05);
  border-color: var(--primary);
}

.delete-btn {
  color: #b91c1c;
  border-color: rgba(185, 28, 28, 0.2);
}

.delete-btn:hover:not(:disabled) {
  background: rgba(185, 28, 28, 0.05);
  border-color: #b91c1c;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-badge {
  display: inline-flex;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.02em;
}

.status-yes {
  background: #dcfce7;
  color: #15803d;
}

.status-no {
  background: #f1f5f9;
  color: #64748b;
}

.primary-btn,
.secondary-btn {
  border-radius: 14px;
  border: 1px solid transparent;
  padding: 0.75rem 1.25rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn {
  background: var(--primary);
  color: #fff;
}

.primary-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(230, 33, 23, 0.3);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  background: #fff;
  color: var(--text);
  border-color: #cbd5e1;
}

.secondary-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
}

.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  border-radius: 16px;
  padding: 0.9rem 1rem;
  font-weight: 700;
}

.alert.success {
  background: #ecfdf5;
  color: #047857;
}

.alert.error {
  background: #fef2f2;
  color: #b91c1c;
}

.state-box {
  min-height: 280px;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.8rem;
  color: var(--text-light);
}

.state-box.error {
  color: #b91c1c;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 3px solid rgba(230, 33, 23, 0.15);
  border-top-color: var(--primary);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: var(--card);
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 1.4rem;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  line-height: 1;
}

.modal-close:hover {
  background: #f1f5f9;
  color: var(--text);
}

.modal-form {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-form::-webkit-scrollbar {
  width: 6px;
}

.modal-form::-webkit-scrollbar-track {
  background: transparent;
}

.modal-form::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-form::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.form-grid {
  display: grid;
  gap: 1rem;
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
  gap: 0.35rem;
  font-weight: 700;
  color: var(--text);
  font-size: 0.85rem;
}

input,
textarea,
select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  font: inherit;
  background: #fff;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 33, 23, 0.1);
}

textarea {
  resize: vertical;
  min-height: 60px;
  max-height: 120px;
}

.checkbox-label {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkbox-label:hover {
  background: #f1f5f9;
}

.checkbox-input {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
  accent-color: var(--primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
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
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .form-grid,
  .form-row.span-2 {
    grid-template-columns: 1fr;
    grid-column: auto;
  }

  .modal {
    max-height: 95vh;
    margin: 0.5rem;
  }

  .modal-header {
    padding: 1rem 1.25rem;
  }

  .modal-form {
    padding: 1.25rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }

  .page-header h2 {
    font-size: 1.45rem;
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions button {
    flex: 1;
  }

  .panel {
    padding: 1rem;
  }

  .actions-cell {
    flex-direction: column;
    gap: 0.3rem;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  table {
    min-width: 600px;
  }

  .admin-page {
    padding: 0.5rem;
  }
}
</style>
