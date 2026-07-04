<template>
  <section class="admin-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Módulo administrativo</p>
        <h2>Check-in / Portaria</h2>
        <p>Leia o QR code ou digite o código.</p>
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
              placeholder="TKT-XXXXXXXX"
              @keyup.enter="buscarIngresso"
              autofocus
              autocomplete="off"
              inputmode="text"
            />
            <button
              class="btn-search"
              @click="buscarIngresso"
              :disabled="loading || !codigoInput.trim()"
            >
              <i class="fa-solid fa-search"></i>
            </button>
          </div>
          <p class="input-help">Digite o código e pressione Enter</p>
        </div>

        <div class="separator"><span>ou</span></div>

        <button class="btn-scanner" @click="abrirScanner">
          <i class="fa-solid fa-qrcode"></i>
          Ler QR code
        </button>
      </div>
    </div>

    <!-- Scanner Fullscreen -->
    <Teleport to="body">
      <div v-if="scannerAtivo" class="scanner-fullscreen">
        <div class="scanner-header">
          <button class="scanner-close" @click="fecharScanner">
            <i class="fa-solid fa-times"></i>
          </button>
          <span>Aponte para o QR code</span>
          <div style="width: 40px"></div>
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
          <p class="scanner-text">Centralize o QR code no quadrado</p>
        </div>
        <div class="scanner-footer">
          <button class="scanner-close-btn" @click="fecharScanner">
            Fechar câmera
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmação -->
    <Teleport to="body">
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
            <!-- Foto do cliente -->
            <div class="modal-avatar">
              <i class="fa-solid fa-circle-user"></i>
            </div>

            <div class="modal-details">
              <div class="detail-row highlight">
                <span class="detail-label">Nome</span>
                <span class="detail-value">{{
                  ticketEncontrado?.nome_completo
                }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Código</span>
                <span class="detail-value code-text">{{
                  ticketEncontrado?.codigo_ingresso
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
                <span class="detail-label">Evento</span>
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
                <i
                  class="fa-solid"
                  :class="confirmando ? 'fa-spinner fa-spin' : 'fa-check'"
                ></i>
                {{ confirmando ? "Confirmando..." : "Confirmar check-in" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
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

// Bloqueia scroll quando scanner ou modal aberto
function bloquearScroll() {
  document.body.style.overflow = "hidden";
}
function liberarScroll() {
  document.body.style.overflow = "";
}

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
  bloquearScroll();
}
function fecharScanner() {
  scannerAtivo.value = false;
  liberarScroll();
}

function onDetect(result) {
  const codigo = result[0]?.rawValue || result;
  codigoInput.value = codigo;
  fecharScanner();
  buscarIngresso();
}

function onScannerError(err) {
  console.error("Scanner:", err);
  showMessage("Erro na câmera. Verifique as permissões.", "error");
  fecharScanner();
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
    bloquearScroll();
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
    showMessage(
      `✅ Check-in realizado! ${result.data.nome_completo}`,
      "success",
    );
    fecharModal();
    codigoInput.value = "";
    setTimeout(() => document.getElementById("codigo")?.focus(), 300);
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
  liberarScroll();
}

onMounted(() => {
  setTimeout(() => document.getElementById("codigo")?.focus(), 300);
});
onUnmounted(() => {
  liberarScroll();
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
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
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
}

.admin-grid {
  display: grid;
  gap: 1rem;
}

.panel {
  background: var(--card);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1.25rem;
}
.panel-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}
.panel-header h3 {
  font-size: 1.1rem;
  margin: 0;
}

/* ============================================ */
/* INPUT */
/* ============================================ */
.input-group {
  margin-bottom: 0.75rem;
}
.input-group label {
  display: block;
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
  color: var(--text);
}
.input-with-icon {
  display: flex;
  gap: 0.4rem;
}
.input-with-icon input {
  flex: 1;
  min-width: 0;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  font: inherit;
  font-size: 1rem;
  font-family: monospace;
  letter-spacing: 1px;
  background: #fff;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.input-with-icon input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 33, 23, 0.1);
}
.input-with-icon input::placeholder {
  font-family: inherit;
  letter-spacing: 0;
  font-size: 0.85rem;
}
.btn-search {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 1rem;
  cursor: pointer;
  font-size: 1rem;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.btn-search:active {
  background: #c81e14;
}
.btn-search:disabled {
  opacity: 0.5;
}
.input-help {
  font-size: 0.7rem;
  color: var(--text-light);
  margin-top: 0.3rem;
}

/* ============================================ */
/* SEPARADOR */
/* ============================================ */
.separator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
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
  font-size: 0.75rem;
  font-weight: 600;
}

/* ============================================ */
/* BOTÃO SCANNER */
/* ============================================ */
.btn-scanner {
  width: 100%;
  padding: 0.85rem;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  color: var(--text);
  font: inherit;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  -webkit-tap-highlight-color: transparent;
}
.btn-scanner:active {
  border-color: var(--primary);
  background: rgba(230, 33, 23, 0.05);
}

/* ============================================ */
/* SCANNER FULLSCREEN */
/* ============================================ */
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
  justify-content: space-between;
  padding: 0.75rem 1rem;
  padding-top: max(0.75rem, env(safe-area-inset-top));
  background: rgba(0, 0, 0, 0.95);
  color: white;
  z-index: 2;
  font-weight: 600;
  font-size: 0.95rem;
}
.scanner-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scanner-body {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.scanner-body :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scanner-overlay-frame {
  position: absolute;
  width: min(250px, 65vw);
  height: min(250px, 65vw);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
}
.corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: var(--primary);
  border-style: solid;
}
.top-left {
  top: -2px;
  left: -2px;
  border-width: 4px 0 0 4px;
  border-radius: 8px 0 0 0;
}
.top-right {
  top: -2px;
  right: -2px;
  border-width: 4px 4px 0 0;
  border-radius: 0 8px 0 0;
}
.bottom-left {
  bottom: -2px;
  left: -2px;
  border-width: 0 0 4px 4px;
  border-radius: 0 0 0 8px;
}
.bottom-right {
  bottom: -2px;
  right: -2px;
  border-width: 0 4px 4px 0;
  border-radius: 0 0 8px 0;
}
.scanner-text {
  position: absolute;
  bottom: 20%;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
  text-align: center;
  padding: 0 1rem;
}
.scanner-footer {
  padding: 1rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
}
.scanner-close-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  font: inherit;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* ============================================ */
/* MODAL */
/* ============================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s;
}
.modal {
  background: var(--card);
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s;
  overflow-y: auto;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: var(--card);
  border-radius: 24px 24px 0 0;
  z-index: 1;
}
.modal-header h3 {
  font-size: 1.2rem;
  margin: 0;
}
.modal-close {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
}
.modal-form {
  padding: 1.25rem 1.5rem;
}

.modal-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.modal-avatar i {
  font-size: 3.5rem;
  color: var(--text-light);
  opacity: 0.4;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.detail-row.highlight {
  background: #f8fafc;
  margin: 0 -0.5rem;
  padding: 0.75rem 0.5rem;
  border-radius: 10px;
  border-bottom: none;
}
.detail-label {
  font-weight: 600;
  color: var(--text-light);
  font-size: 0.8rem;
}
.detail-value {
  font-weight: 700;
  font-size: 0.85rem;
  text-align: right;
  word-break: break-word;
  max-width: 60%;
}
.code-text {
  font-family: monospace;
  color: var(--primary);
  font-size: 0.75rem;
}

.status-badge {
  display: inline-flex;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
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
  gap: 0.6rem;
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.85rem;
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
  gap: 0.6rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.modal-actions button {
  flex: 1;
}

.primary-btn,
.secondary-btn {
  border-radius: 14px;
  padding: 0.8rem 1rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  -webkit-tap-highlight-color: transparent;
}
.primary-btn {
  background: var(--primary);
  color: #fff;
  border: none;
}
.primary-btn:active {
  background: #c81e14;
}
.primary-btn:disabled {
  opacity: 0.6;
}
.secondary-btn {
  background: #fff;
  color: var(--text);
  border: 1px solid #cbd5e1;
}
.secondary-btn:active {
  background: #f8fafc;
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
/* RESPONSIVO - DESKTOP */
/* ============================================ */
@media (min-width: 769px) {
  .admin-page {
    padding: 1.5rem;
  }
  .page-header {
    padding: 1.5rem;
    border-radius: 24px;
  }
  .page-header h2 {
    font-size: 1.7rem;
  }
  .panel {
    padding: 1.5rem;
    border-radius: 24px;
  }
  .panel-header h3 {
    font-size: 1.3rem;
  }

  .modal {
    border-radius: 24px;
    margin: auto;
    max-height: 85vh;
  }
  .modal-header {
    border-radius: 24px 24px 0 0;
  }

  .scanner-overlay-frame {
    width: 300px;
    height: 300px;
  }
}
</style>
