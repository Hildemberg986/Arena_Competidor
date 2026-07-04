<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Preços</h2>
        <p>Configure preços por campeonato, lote e tipo de inscrição.</p>
      </div>

      <div class="header-actions">
        <button type="button" class="secondary-btn" @click="loadData" :disabled="loading">
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
          <button class="secondary-btn" type="button" @click="loadData">Tentar novamente</button>
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
                    <span class="info-main">{{ campeonatoName(resolveCampeonatoId(item)) }}</span>
                  </div>
                </td>
                <td>
                  <span class="info-text">{{ loteName(item.lote_id) }}</span>
                </td>
                <td>
                  <span class="info-text">{{ tipoName(item.tipo_inscricao_id) }}</span>
                </td>
                <td>
                  <span class="price-text">{{ formatCurrencyBR(item.preco) }}</span>
                </td>
                <td>
                  <span class="info-text">{{ item.quantidade_disponivel }}</span>
                </td>
                <td>
                  <span class="status-badge" :class="getStatusClass(item.status)">
                    {{ item.status || 'ativo' }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button type="button" class="action-btn edit-btn" @click="openEditForm(item)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </button>
                  <button type="button" class="action-btn delete-btn" @click="handleDelete(item)" :disabled="deletingId === item.id">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    {{ deletingId === item.id ? 'Excluindo...' : 'Excluir' }}
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
          <h3>{{ editingId ? 'Editar Preço' : 'Novo Preço' }}</h3>
          <button type="button" class="modal-close" @click="cancelForm">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleSubmit">
          <!-- Erro dentro do modal -->
          <div v-if="modalError" class="modal-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{{ modalError }}</span>
          </div>

          <div class="form-grid">
            <div class="form-row span-2">
              <label>
                Campeonato *
                <select v-model.number="form.campeonato_id" required @change="handleCampeonatoChange">
                  <option :value="0" disabled>Selecione um campeonato</option>
                  <option v-for="item in campeonatos" :key="item.id" :value="Number(item.id)">
                    {{ item.nome_campeonato }}
                  </option>
                </select>
              </label>
            </div>

            <div class="form-row">
              <label>
                Lote *
                <select v-model.number="form.lote_id" required :disabled="!filteredLotes.length">
                  <option :value="0" disabled>Selecione um lote</option>
                  <option v-for="item in filteredLotes" :key="item.id" :value="Number(item.id)">
                    {{ item.nome_lote }}
                  </option>
                </select>
              </label>
            </div>

            <div class="form-row">
              <label>
                Tipo de inscrição *
                <select v-model.number="form.tipo_inscricao_id" required :disabled="!filteredTipos.length">
                  <option :value="0" disabled>Selecione um tipo</option>
                  <option v-for="item in filteredTipos" :key="item.id" :value="Number(item.id)">
                    {{ item.nome_tipo }}
                  </option>
                </select>
              </label>
            </div>

            <div class="form-row">
              <label>
                Preço (R$) *
                <input v-model.number="form.preco" type="number" min="0" step="0.01" required placeholder="0,00">
              </label>
            </div>

            <div class="form-row">
              <label>
                Quantidade disponível *
                <input v-model.number="form.quantidade_disponivel" type="number" min="0" required placeholder="0">
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
            <button class="secondary-btn" type="button" @click="cancelForm">Cancelar</button>
            <button class="primary-btn" type="submit" :disabled="!canSubmit || saving">
              {{ saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { adminService } from '@/services/api'
import { formatCurrencyBR, getApiErrorMessage, unwrapCollection, unwrapItem } from '@/utils/adminHelpers'

const precos = ref([])
const campeonatos = ref([])
const lotes = ref([])
const tipos = ref([])
const loading = ref(false)
const saving = ref(false)
const deletingId = ref(null)
const error = ref('')
const feedback = ref('')
const feedbackType = ref('success')
const showForm = ref(false)
const editingId = ref(null)
const modalError = ref('')

const emptyForm = () => ({
  campeonato_id: 0,
  lote_id: 0,
  tipo_inscricao_id: 0,
  preco: 0,
  quantidade_disponivel: 0,
  status: 'ativo'
})

const form = reactive(emptyForm())

const selectedCampeonatoId = computed(() => Number(form.campeonato_id || 0))

const filteredLotes = computed(() => {
  if (!selectedCampeonatoId.value) return []
  return lotes.value.filter((item) => Number(item.campeonato_id) === selectedCampeonatoId.value)
})

const filteredTipos = computed(() => {
  if (!selectedCampeonatoId.value) return []
  return tipos.value.filter((item) => Number(item.campeonato_id) === selectedCampeonatoId.value)
})

const canSubmit = computed(() => {
  return Boolean(
    form.campeonato_id &&
    form.lote_id &&
    form.tipo_inscricao_id &&
    Number(form.preco) >= 0 &&
    Number(form.quantidade_disponivel) >= 0
  )
})

function resetForm() {
  Object.assign(form, emptyForm())
  editingId.value = null
  modalError.value = ''
}

function openCreateForm() {
  resetForm()
  showForm.value = true
}

function resolveCampeonatoId(item) {
  const lote = lotes.value.find((entry) => Number(entry.id) === Number(item?.lote_id))
  const tipo = tipos.value.find((entry) => Number(entry.id) === Number(item?.tipo_inscricao_id))
  return Number(item?.campeonato_id || lote?.campeonato_id || tipo?.campeonato_id || 0)
}

function openEditForm(item) {
  const data = unwrapItem(item) || item
  const campeonatoId = resolveCampeonatoId(data)

  Object.assign(form, emptyForm(), {
    ...data,
    campeonato_id: campeonatoId,
    lote_id: Number(data?.lote_id || 0),
    tipo_inscricao_id: Number(data?.tipo_inscricao_id || 0),
    preco: Number(data?.preco || 0),
    quantidade_disponivel: Number(data?.quantidade_disponivel || 0),
    status: data?.status || 'ativo'
  })

  editingId.value = data.id
  modalError.value = ''
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  feedback.value = ''
  resetForm()
}

function showMessage(message, type = 'success') {
  feedback.value = message
  feedbackType.value = type
}

function campeonatoName(campeonatoId) {
  const match = campeonatos.value.find((item) => Number(item.id) === Number(campeonatoId))
  return match?.nome_campeonato || '-'
}

function loteName(loteId) {
  const match = lotes.value.find((item) => Number(item.id) === Number(loteId))
  return match?.nome_lote || '-'
}

function tipoName(tipoId) {
  const match = tipos.value.find((item) => Number(item.id) === Number(tipoId))
  return match?.nome_tipo || '-'
}

function getStatusClass(status) {
  const statusMap = {
    'ativo': 'status-active',
    'inativo': 'status-inactive',
    'esgotado': 'status-soldout',
    'encerrado': 'status-finished'
  }
  return statusMap[status?.toLowerCase()] || 'status-active'
}

function handleCampeonatoChange() {
  form.lote_id = 0
  form.tipo_inscricao_id = 0
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const [campeonatosResponse, lotesResponse, tiposResponse, precosResponse] = await Promise.all([
      adminService.getCampeonatos(),
      adminService.getLotes(),
      adminService.getTiposInscricao(),
      adminService.getPrecos()
    ])

    campeonatos.value = unwrapCollection(campeonatosResponse)
    lotes.value = unwrapCollection(lotesResponse)
    tipos.value = unwrapCollection(tiposResponse)
    precos.value = unwrapCollection(precosResponse)
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Não foi possível carregar os preços.')
  } finally {
    loading.value = false
  }
}

watch(selectedCampeonatoId, (value, previousValue) => {
  if (previousValue && value !== previousValue) {
    form.lote_id = 0
    form.tipo_inscricao_id = 0
  }
})

async function handleSubmit() {
  if (!canSubmit.value || saving.value) return

  saving.value = true
  modalError.value = ''

  const payload = {
    lote_id: Number(form.lote_id),
    tipo_inscricao_id: Number(form.tipo_inscricao_id),
    preco: Number(form.preco),
    quantidade_disponivel: Number(form.quantidade_disponivel)
  }

  if (editingId.value) {
    payload.status = form.status || 'ativo'
  }

  try {
    if (editingId.value) {
      await adminService.updatePreco(editingId.value, payload)
      showMessage('Preço atualizado com sucesso.')
    } else {
      await adminService.createPreco(payload)
      showMessage('Preço criado com sucesso.')
    }

    showForm.value = false
    resetForm()
    await loadData()
  } catch (err) {
    modalError.value = getApiErrorMessage(err, 'Não foi possível salvar o preço.')
  } finally {
    saving.value = false
  }
}

async function handleDelete(item) {
  const data = unwrapItem(item) || item
  const confirmed = window.confirm('Excluir este preço?')

  if (!confirmed) return

  deletingId.value = data.id

  try {
    await adminService.deletePreco(data.id)
    showMessage('Preço excluído com sucesso.')
    await loadData()
  } catch (err) {
    showMessage(getApiErrorMessage(err, 'Não foi possível excluir o preço.'), 'error')
  } finally {
    deletingId.value = null
  }
}

onMounted(loadData)
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
  min-width: 900px;
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

.info-text {
  font-weight: 500;
  color: var(--text);
}

.price-text {
  font-weight: 700;
  color: var(--primary);
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

/* Erro no modal */
.modal-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 14px;
  padding: 0.9rem 1rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  animation: shakeError 0.3s ease;
}

.modal-error svg {
  flex-shrink: 0;
  color: #dc2626;
}

@keyframes shakeError {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
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
select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 33, 23, 0.1);
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
    min-width: 700px;
  }

  .admin-page {
    padding: 0.5rem;
  }
}
</style>