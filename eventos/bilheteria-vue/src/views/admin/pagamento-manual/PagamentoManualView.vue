<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Pagamento manual</h2>
        <p>Aprove compras pendentes com pagamento em mãos.</p>
      </div>

      <div class="header-actions">
        <button type="button" class="secondary-btn" @click="loadTickets" :disabled="loading">
          Recarregar
        </button>
      </div>
    </div>

    <p v-if="feedback" class="alert" :class="feedbackType">{{ feedback }}</p>

    <div class="admin-grid">
      <div class="panel table-panel">
        <div class="panel-header">
          <h3>Lista de Compras</h3>
          <span class="total-count">{{ comprasAgrupadas.length }} compras</span>
        </div>

        <div v-if="loading" class="state-box">
          <span class="spinner"></span>
          <p>Carregando ingressos...</p>
        </div>

        <div v-else-if="error" class="state-box error">
          <p>{{ error }}</p>
          <button class="secondary-btn" type="button" @click="loadTickets">Tentar novamente</button>
        </div>

        <div v-else-if="!comprasAgrupadas.length" class="state-box">
          <p>Nenhum ingresso encontrado.</p>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Compra</th>
                <th>Cliente</th>
                <th>Campeonato</th>
                <th>Lote / Tipo</th>
                <th>Qtd</th>
                <th>Valor total</th>
                <th>Status</th>
                <th>Data</th>
                <th class="actions-header">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="compra in comprasAgrupadas" :key="compra.compra_id">
                <td>
                  <span class="code-text">#{{ compra.compra_id }}</span>
                </td>
                <td>
                  <div class="info-cell">
                    <span class="info-main">{{ compra.cliente }}</span>
                    <span class="info-sub">{{ compra.cpf || '-' }}</span>
                  </div>
                </td>
                <td>
                  <span class="info-text">{{ compra.campeonato }}</span>
                </td>
                <td>
                  <span class="info-text">{{ compra.lote }} / {{ compra.tipo }}</span>
                </td>
                <td>
                  <span class="qtd-badge">{{ compra.quantidade }}</span>
                </td>
                <td>
                  <span class="price-text">{{ formatCurrency(compra.valor_total) }}</span>
                </td>
                <td>
                  <span :class="['status-badge', getStatusClass(compra.status)]">
                    {{ compra.status }}
                  </span>
                </td>
                <td>
                  <span class="info-text">{{ formatDate(compra.data) }}</span>
                </td>
                <td class="actions-cell">
                  <button
                    v-if="compra.status === 'Pendente'"
                    type="button"
                    class="action-btn approve-btn"
                    @click="abrirModalPagamento(compra)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Pagar
                  </button>
                  <button
                    v-else
                    type="button"
                    class="action-btn edit-btn"
                    @click="abrirModalDetalhes(compra)"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    Detalhes
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Pagamento -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="fecharModais">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirmar pagamento</h3>
          <button type="button" class="modal-close" @click="fecharModais">✕</button>
        </div>

        <div class="modal-form">
          <div class="modal-details">
            <div class="detail-row">
              <span class="detail-label">Compra</span>
              <span class="detail-value">#{{ compraSelecionada?.compra_id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cliente</span>
              <span class="detail-value">{{ compraSelecionada?.cliente }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">CPF</span>
              <span class="detail-value">{{ compraSelecionada?.cpf || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Campeonato</span>
              <span class="detail-value">{{ compraSelecionada?.campeonato }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lote / Tipo</span>
              <span class="detail-value">{{ compraSelecionada?.lote }} / {{ compraSelecionada?.tipo }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Quantidade</span>
              <span class="detail-value">{{ compraSelecionada?.quantidade }} ingresso(s)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Valor unitário</span>
              <span class="detail-value">{{ formatCurrency(compraSelecionada?.valor_unitario) }}</span>
            </div>
            <div class="detail-row detail-total">
              <span class="detail-label">Valor total</span>
              <span class="detail-value">{{ formatCurrency(compraSelecionada?.valor_total) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Data criação</span>
              <span class="detail-value">{{ formatDateTime(compraSelecionada?.data) }}</span>
            </div>
            <!-- <div class="detail-row">
              <span class="detail-label">Tipo de pagamento</span>
              <span class="detail-value payment-method">Em mãos (manual)</span>
            </div> -->
          </div>

          <div class="modal-warning">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>Ao confirmar, TODOS os {{ compraSelecionada?.quantidade }} ingresso(s) desta compra serão aprovados.</span>
          </div>

          <div class="modal-actions">
            <button class="secondary-btn" type="button" @click="fecharModais">Cancelar</button>
            <button class="primary-btn" type="button" @click="confirmarPagamento" :disabled="approving">
              {{ approving ? 'Aprovando...' : 'Confirmar pagamento' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="fecharModais">
      <div class="modal">
        <div class="modal-header">
          <h3>Detalhes da compra</h3>
          <button type="button" class="modal-close" @click="fecharModais">✕</button>
        </div>

        <div class="modal-form">
          <div class="modal-details">
            <div class="detail-row">
              <span class="detail-label">Compra</span>
              <span class="detail-value">#{{ compraSelecionada?.compra_id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span :class="['status-badge', getStatusClass(compraSelecionada?.status)]">{{ compraSelecionada?.status }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cliente</span>
              <span class="detail-value">{{ compraSelecionada?.cliente }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">CPF</span>
              <span class="detail-value">{{ compraSelecionada?.cpf || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ compraSelecionada?.email || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Campeonato</span>
              <span class="detail-value">{{ compraSelecionada?.campeonato }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Lote / Tipo</span>
              <span class="detail-value">{{ compraSelecionada?.lote }} / {{ compraSelecionada?.tipo }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Quantidade</span>
              <span class="detail-value">{{ compraSelecionada?.quantidade }} ingresso(s)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Valor unitário</span>
              <span class="detail-value">{{ formatCurrency(compraSelecionada?.valor_unitario) }}</span>
            </div>
            <div class="detail-row detail-total">
              <span class="detail-label">Valor total</span>
              <span class="detail-value">{{ formatCurrency(compraSelecionada?.valor_total) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Data criação</span>
              <span class="detail-value">{{ formatDateTime(compraSelecionada?.data) }}</span>
            </div>
            <div class="detail-row" v-if="compraSelecionada?.data_pagamento">
              <span class="detail-label">Data pagamento</span>
              <span class="detail-value">{{ formatDateTime(compraSelecionada?.data_pagamento) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tipo de pagamento</span>
              <span class="detail-value payment-method">{{ getTipoPagamento(compraSelecionada) }}</span>
            </div>
            <div class="detail-row" v-if="compraSelecionada?.mercado_pago_id && compraSelecionada?.mercado_pago_id !== 'MANUAL'">
              <span class="detail-label">Mercado Pago ID</span>
              <span class="detail-value code-text">{{ compraSelecionada?.mercado_pago_id }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="secondary-btn" type="button" @click="fecharModais">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { adminService } from '@/services/api'
import { getApiErrorMessage, unwrapCollection } from '@/utils/adminHelpers'

const tickets = ref([])
const loading = ref(false)
const approving = ref(false)
const error = ref('')
const feedback = ref('')
const feedbackType = ref('success')
const showPaymentModal = ref(false)
const showDetailModal = ref(false)
const compraSelecionada = ref(null)

const comprasAgrupadas = computed(() => {
  const grupos = new Map()

  tickets.value.forEach(t => {
    const chave = t.compra_id || t.id
    
    if (!grupos.has(chave)) {
      grupos.set(chave, {
        compra_id: chave,
        cliente: t.nome_completo,
        cpf: t.cpf,
        email: t.email,
        campeonato: t.nome_campeonato || '-',
        lote: t.nome_lote || '-',
        tipo: t.nome_tipo || '-',
        quantidade: 0,
        valor_unitario: t.valor_unitario || 0,
        valor_total: 0,
        status: t.status_pagamento,
        data: t.data_criacao,
        data_pagamento: t.data_pagamento,
        mercado_pago_id: t.mercado_pago_id,
        primeiro_ticket_id: t.id,
      })
    }
    
    const grupo = grupos.get(chave)
    grupo.quantidade += 1
    grupo.valor_total += Number(t.total || t.valor_unitario || 0)
  })

  return Array.from(grupos.values())
})

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getStatusClass(status) {
  const map = {
    'Pendente': 'status-pendente',
    'Aprovado': 'status-aprovado',
    'Cancelado': 'status-cancelado',
    'Estornado': 'status-estornado',
    'Rejeitado': 'status-rejeitado',
    'Expirado': 'status-expirado'
  }
  return map[status] || 'status-pendente'
}

function getTipoPagamento(compra) {
  if (!compra) return '-'
  if (compra.mercado_pago_id === 'MANUAL') return 'Em mãos (manual)'
  if (compra.mercado_pago_id) return 'Mercado Pago'
  return '-'
}

function showMessage(message, type = 'success') {
  feedback.value = message
  feedbackType.value = type
  setTimeout(() => { feedback.value = '' }, 5000)
}

function abrirModalPagamento(compra) {
  compraSelecionada.value = compra
  showPaymentModal.value = true
}

function abrirModalDetalhes(compra) {
  compraSelecionada.value = compra
  showDetailModal.value = true
}

function fecharModais() {
  showPaymentModal.value = false
  showDetailModal.value = false
  compraSelecionada.value = null
}

async function loadTickets() {
  loading.value = true
  error.value = ''

  try {
    const response = await adminService.getTickets()
    tickets.value = unwrapCollection(response)
  } catch (err) {
    error.value = getApiErrorMessage(err, 'Não foi possível carregar os ingressos.')
  } finally {
    loading.value = false
  }
}

async function confirmarPagamento() {
  if (!compraSelecionada.value || approving.value) return

  approving.value = true

  try {
    const response = await adminService.pagarManual(compraSelecionada.value.primeiro_ticket_id)
    const aprovados = response?.data?.quantidade || compraSelecionada.value.quantidade
    showMessage(`Compra #${compraSelecionada.value.compra_id} aprovada! ${aprovados} ingresso(s) pago(s).`)
    fecharModais()
    await loadTickets()
  } catch (err) {
    showMessage(getApiErrorMessage(err, 'Erro ao aprovar pagamento.'), 'error')
  } finally {
    approving.value = false
  }
}

onMounted(loadTickets)
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

.info-sub {
  font-size: 0.8rem;
  color: var(--text-light);
}

.info-text {
  font-weight: 500;
  color: var(--text);
}

.code-text {
  font-family: monospace;
  font-weight: 700;
  color: var(--primary);
  font-size: 0.85rem;
}

.qtd-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
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
  font-family: inherit;
}

.approve-btn {
  color: #15803d;
  background: #dcfce7;
  border-color: rgba(21, 128, 61, 0.2);
}

.approve-btn:hover:not(:disabled) {
  background: #bbf7d0;
  border-color: #15803d;
}

.edit-btn {
  color: var(--primary);
  border-color: rgba(230, 33, 23, 0.2);
}

.edit-btn:hover:not(:disabled) {
  background: rgba(230, 33, 23, 0.05);
  border-color: var(--primary);
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

.status-pendente {
  background: #fef3c7;
  color: #92400e;
}

.status-aprovado {
  background: #dcfce7;
  color: #15803d;
}

.status-cancelado {
  background: #fee2e2;
  color: #dc2626;
}

.status-estornado {
  background: #f1f5f9;
  color: #64748b;
}

.status-rejeitado {
  background: #fee2e2;
  color: #b91c1c;
}

.status-expirado {
  background: #f1f5f9;
  color: #94a3b8;
}

.payment-method {
  color: var(--primary);
  font-style: italic;
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
  to { transform: rotate(360deg); }
}

/* Modal */
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
  max-width: 520px;
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

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.85rem;
}

.detail-value {
  font-weight: 700;
  color: var(--text);
  font-size: 0.9rem;
  text-align: right;
}

.detail-total {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border-bottom: none;
}

.detail-total .detail-value {
  color: var(--primary);
  font-size: 1.1rem;
}

.modal-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #fef3c7;
  color: #92400e;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.modal-warning i {
  font-size: 1.1rem;
  margin-top: 0.1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 768px) {
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

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .detail-value {
    text-align: left;
  }
}
</style>