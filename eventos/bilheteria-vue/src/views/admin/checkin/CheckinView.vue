<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Check-in / Portaria</h2>
        <p>Leia o QR code ou digite o código do ingresso.</p>
      </div>
    </div>

    <p v-if="feedback" class="alert" :class="feedbackType">{{ feedback }}</p>

    <div class="admin-grid">
      <div class="panel">
        <div class="panel-header">
          <h3>Leitura do ingresso</h3>
        </div>

        <div class="input-group">
          <label for="codigo">Código do ingresso</label>
          <div class="input-with-icon">
            <input
              id="codigo"
              v-model="codigoInput"
              type="text"
              placeholder="TKT-XXXXXXXX ou leia o QR code"
              @keyup.enter="buscarIngresso"
              autofocus
              autocomplete="off"
            />
            <button
              class="btn-search"
              @click="buscarIngresso"
              :disabled="loading || !codigoInput.trim()"
            >
              <i class="fa-solid fa-search"></i>
            </button>
          </div>
          <p class="input-help">Pressione Enter ou clique no ícone de busca</p>
        </div>

        <div class="separator"><span>ou</span></div>

        <button class="btn-scanner" @click="abrirScanner">
          <i class="fa-solid fa-qrcode"></i>
          Ler QR code
        </button>
      </div>
    </div>

    <!-- Scanner em tela cheia -->
    <div v-if="scannerAtivo" class="scanner-fullscreen">
      <div class="scanner-header">
        <button class="scanner-close" @click="fecharScanner">
          <i class="fa-solid fa-arrow-left"></i> Fechar
        </button>
        <span>Aponte para o QR code</span>
      </div>
      <div class="scanner-body">
        <qrcode-stream
          :camera="cameraOptions"
          @detect="onDetect"
          @error="onScannerError"
        />
        <div class="scanner-overlay-frame">
          <div class="corner top-left"></div>
          <div class="corner top-right"></div>
          <div class="corner bottom-left"></div>
          <div class="corner bottom-right"></div>
        </div>
        <p class="scanner-text">Centralize o QR code na área</p>
      </div>
    </div>

    <!-- Modal de confirmação -->
    <div
      v-if="showConfirmModal"
      class="modal-overlay"
      @click.self="fecharModal"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Confirmar check-in</h3>
          <button type="button" class="modal-close" @click="fecharModal">
            ✕
          </button>
        </div>

        <div class="modal-form">
          <div class="modal-details">
            <div class="detail-row">
              <span class="detail-label">Código</span>
              <span class="detail-value code-text">{{
                ticketEncontrado?.codigo_ingresso
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Nome</span>
              <span class="detail-value">{{
                ticketEncontrado?.nome_completo
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">CPF</span>
              <span class="detail-value">{{ ticketEncontrado?.cpf }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tipo / Lote</span>
              <span class="detail-value"
                >{{ ticketEncontrado?.nome_tipo }} /
                {{ ticketEncontrado?.nome_lote }}</span
              >
            </div>
            <div class="detail-row">
              <span class="detail-label">Campeonato</span>
              <span class="detail-value">{{
                ticketEncontrado?.nome_campeonato
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span
                :class="[
                  'status-badge',
                  getStatusClass(ticketEncontrado?.status_pagamento),
                ]"
              >
                {{ ticketEncontrado?.status_pagamento }}
              </span>
            </div>
          </div>

          <div
            v-if="
              ticketEncontrado?.status_pagamento === 'Aprovado' &&
              !ticketEncontrado?.checkin_em
            "
            class="modal-success"
          >
            <i class="fa-solid fa-circle-check"></i>
            <span>Ingresso válido! Pronto para check-in.</span>
          </div>

          <div v-if="ticketEncontrado?.checkin_em" class="modal-warning">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span
              >Já utilizado em
              {{ formatDateTime(ticketEncontrado?.checkin_em) }}</span
            >
          </div>

          <div
            v-if="ticketEncontrado?.status_pagamento !== 'Aprovado'"
            class="modal-error-box"
          >
            <i class="fa-solid fa-circle-xmark"></i>
            <span
              >Não está aprovado. Status:
              {{ ticketEncontrado?.status_pagamento }}</span
            >
          </div>

          <div class="modal-actions">
            <button class="secondary-btn" type="button" @click="fecharModal">
              Cancelar
            </button>
            <button
              v-if="
                ticketEncontrado?.status_pagamento === 'Aprovado' &&
                !ticketEncontrado?.checkin_em
              "
              class="primary-btn"
              type="button"
              @click="confirmarCheckin"
              :disabled="confirmando"
            >
              {{ confirmando ? "Confirmando..." : "Confirmar check-in" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { adminService } from "@/services/api";

const codigoInput = ref("");
const loading = ref(false);
const confirmando = ref(false);
const feedback = ref("");
const feedbackType = ref("success");
const scannerAtivo = ref(false);
const showConfirmModal = ref(false);
const ticketEncontrado = ref(null);

const cameraOptions = { facingMode: "environment" };

function formatDateTime(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  const map = {
    Aprovado: "status-approved",
    Pendente: "status-pending",
    Cancelado: "status-cancelled",
  };
  return map[status] || "status-pending";
}

function showMessage(message, type = "success") {
  feedback.value = message;
  feedbackType.value = type;
  setTimeout(() => {
    feedback.value = "";
  }, 5000);
}

function abrirScanner() {
  scannerAtivo.value = true;
}
function fecharScanner() {
  scannerAtivo.value = false;
}

function onDetect(result) {
  const codigo = result[0]?.rawValue || result;
  codigoInput.value = codigo;
  scannerAtivo.value = false;
  buscarIngresso();
}

function onScannerError(err) {
  console.error("Scanner:", err);
  showMessage("Erro na câmera. Verifique as permissões.", "error");
  scannerAtivo.value = false;
}

async function buscarIngresso() {
  const codigo = codigoInput.value.trim();
  if (!codigo) return;
  loading.value = true;
  feedback.value = "";

  try {
    const response = await adminService.getTicketByCodigo(codigo);
    const data = response?.data || response;
    if (!data) {
      showMessage("Ingresso não encontrado.", "error");
      return;
    }
    ticketEncontrado.value = data;
    showConfirmModal.value = true;
  } catch (err) {
    showMessage(
      err?.response?.data?.detail || "Ingresso não encontrado.",
      "error",
    );
  } finally {
    loading.value = false;
  }
}

async function confirmarCheckin() {
  if (!ticketEncontrado.value?.codigo_ingresso || confirmando.value) return;
  confirmando.value = true;

  try {
    const result = await adminService.checkin(
      ticketEncontrado.value.codigo_ingresso,
    );
    showMessage(`Check-in realizado! ${result.data.nome_completo}`, "success");
    fecharModal();
    codigoInput.value = "";
  } catch (err) {
    showMessage(
      err?.response?.data?.detail || "Erro ao fazer check-in",
      "error",
    );
    fecharModal();
  } finally {
    confirmando.value = false;
  }
}

function fecharModal() {
  showConfirmModal.value = false;
  ticketEncontrado.value = null;
}

onMounted(() => {
  setTimeout(() => document.getElementById("codigo")?.focus(), 300);
});
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 800px;
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

.admin-grid {
  display: grid;
  gap: 1.5rem;
}
.panel {
  background: var(--card);
  border-radius: 24px;
  box-shadow: var(--shadow);
  padding: 1.5rem;
}
.panel-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}
.panel-header h3 {
  font-size: 1.3rem;
  margin: 0;
}

.input-group {
  margin-bottom: 1rem;
}
.input-group label {
  display: block;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
.input-with-icon {
  display: flex;
  gap: 0.5rem;
}
.input-with-icon input {
  flex: 1;
  border: 2px solid #cbd5e1;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  font: inherit;
  font-size: 1.1rem;
  font-family: monospace;
  letter-spacing: 1px;
}
.input-with-icon input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 33, 23, 0.1);
}
.btn-search {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 0 1.2rem;
  cursor: pointer;
  font-size: 1.1rem;
}
.btn-search:hover:not(:disabled) {
  background: #c81e14;
}
.btn-search:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.input-help {
  font-size: 0.75rem;
  color: var(--text-light);
  margin-top: 0.35rem;
}

.separator {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
}
.separator::before,
.separator::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.separator span {
  color: var(--text-light);
  font-size: 0.8rem;
  font-weight: 600;
}

.btn-scanner {
  width: 100%;
  padding: 1rem;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  color: var(--text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-scanner:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* Scanner Fullscreen */
.scanner-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  flex-direction: column;
}
.scanner-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  z-index: 2;
}
.scanner-header span {
  font-weight: 600;
  font-size: 0.95rem;
}
.scanner-close {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.scanner-body {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scanner-body video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scanner-overlay-frame {
  position: absolute;
  width: 250px;
  height: 250px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
}
.corner {
  position: absolute;
  width: 25px;
  height: 25px;
  border-color: var(--primary);
  border-style: solid;
}
.top-left {
  top: -2px;
  left: -2px;
  border-width: 4px 0 0 4px;
  border-radius: 6px 0 0 0;
}
.top-right {
  top: -2px;
  right: -2px;
  border-width: 4px 4px 0 0;
  border-radius: 0 6px 0 0;
}
.bottom-left {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 4px 4px;
  border-radius: 0 0 0 6px;
}
.bottom-right {
  bottom: -2px;
  right: -2px;
  border-width: 0 4px 4px 0;
  border-radius: 0 0 6px 0;
}
.scanner-text {
  position: absolute;
  bottom: 15%;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s;
}
.modal {
  background: var(--card);
  border-radius: 24px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h3 {
  font-size: 1.3rem;
  margin: 0;
}
.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
}
.modal-close:hover {
  background: #f1f5f9;
}
.modal-form {
  padding: 2rem;
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
.detail-label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.85rem;
}
.detail-value {
  font-weight: 700;
  font-size: 0.9rem;
  text-align: right;
}
.code-text {
  font-family: monospace;
  color: var(--primary);
}

.status-badge {
  display: inline-flex;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-approved {
  background: #dcfce7;
  color: #15803d;
}
.status-pending {
  background: #fef3c7;
  color: #92400e;
}
.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.modal-success,
.modal-warning,
.modal-error-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  margin-bottom: 1.5rem;
  font-weight: 600;
}
.modal-success {
  background: #f0fdf4;
  color: #15803d;
}
.modal-warning {
  background: #fef3c7;
  color: #92400e;
}
.modal-error-box {
  background: #fef2f2;
  color: #b91c1c;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}
.primary-btn,
.secondary-btn {
  border-radius: 14px;
  padding: 0.75rem 1.25rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.primary-btn {
  background: var(--primary);
  color: #fff;
  border: none;
}
.primary-btn:hover:not(:disabled) {
  background: #c81e14;
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.secondary-btn {
  background: #fff;
  color: var(--text);
  border: 1px solid #cbd5e1;
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
</style>
