<template>
  <section class="checkin-page">
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
          />
          <button
            class="btn-search"
            @click="buscarIngresso"
            :disabled="loading || !codigoInput.trim()"
          >
            <i class="fa-solid fa-search"></i>
          </button>
        </div>
      </div>

      <div class="separator"><span>ou</span></div>

      <button class="btn-scanner" @click="abrirScanner">
        <i class="fa-solid fa-qrcode"></i> Ler QR code
      </button>
    </div>

    <p v-if="feedback" class="alert" :class="feedbackType">{{ feedback }}</p>

    <!-- Scanner -->
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
          <p class="scanner-text">Centralize o QR code</p>
        </div>
        <div class="scanner-footer">
          <button class="scanner-close-btn" @click="fecharScanner">
            Fechar câmera
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Modal -->
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
              <i class="fa-solid fa-circle-check"></i> Ingresso válido!
            </div>
            <div v-if="ticketEncontrado?.checkin_em" class="modal-warning">
              <i class="fa-solid fa-triangle-exclamation"></i> Já utilizado
            </div>
            <div
              v-if="ticketEncontrado?.status_pagamento !== 'Aprovado'"
              class="modal-error-box"
            >
              <i class="fa-solid fa-circle-xmark"></i> Não aprovado
            </div>

            <div class="modal-actions">
              <button class="secondary-btn" @click="fecharModal">
                Cancelar
              </button>
              <button
                v-if="
                  ticketEncontrado?.status_pagamento === 'Aprovado' &&
                  !ticketEncontrado?.checkin_em
                "
                class="primary-btn"
                @click="confirmarCheckin"
                :disabled="confirmando"
              >
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

function bloquearScroll() {
  document.body.style.overflow = "hidden";
}
function liberarScroll() {
  document.body.style.overflow = "";
}

function getStatusClass(status) {
  return (
    {
      Aprovado: "status-approved",
      Pendente: "status-pending",
      Cancelado: "status-cancelled",
    }[status] || "status-pending"
  );
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
  codigoInput.value = result[0]?.rawValue || result;
  fecharScanner();
  buscarIngresso();
}

function onScannerError() {
  showMessage("Erro na câmera", "error");
  fecharScanner();
}

async function buscarIngresso() {
  const codigo = codigoInput.value.trim();
  if (!codigo) return;
  loading.value = true;
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
.checkin-page {
  max-width: 600px;
  margin: 0 auto;
}
.panel {
  background: #fff;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.panel-header {
  margin-bottom: 1rem;
}
.panel-header h3 {
  font-size: 1rem;
}
.input-group label {
  display: block;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}
.input-with-icon {
  display: flex;
  gap: 0.4rem;
}
.input-with-icon input {
  flex: 1;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  padding: 0.75rem;
  font: inherit;
  font-family: monospace;
  -webkit-appearance: none;
  appearance: none;
}
.input-with-icon input:focus {
  outline: none;
  border-color: #059669;
}
.btn-search {
  background: #059669;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 1rem;
  cursor: pointer;
}
.separator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
  color: #94a3b8;
  font-size: 0.75rem;
}
.separator::before,
.separator::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.btn-scanner {
  width: 100%;
  padding: 0.85rem;
  border: 2px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.alert {
  border-radius: 12px;
  padding: 0.75rem;
  font-weight: 700;
  font-size: 0.85rem;
  margin-top: 1rem;
}
.alert.success {
  background: #ecfdf5;
  color: #047857;
}
.alert.error {
  background: #fef2f2;
  color: #b91c1c;
}

/* Scanner fullscreen - mesmo de antes */
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
  font-weight: 600;
}
.scanner-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
}
.scanner-body {
  flex: 1;
  position: relative;
}
.scanner-overlay-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
}
.corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border-color: #059669;
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
  width: 100%;
  text-align: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
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
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
}
.modal-close {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
}
.modal-form {
  padding: 1.25rem;
}
.modal-avatar {
  text-align: center;
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
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
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.detail-row.highlight {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 10px;
}
.detail-label {
  font-weight: 600;
  color: #64748b;
  font-size: 0.8rem;
}
.detail-value {
  font-weight: 700;
  font-size: 0.85rem;
}
.code-text {
  font-family: monospace;
  color: #059669;
}
.status-badge {
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
  gap: 0.5rem;
  padding: 0.75rem;
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
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.modal-actions button {
  flex: 1;
}
.primary-btn,
.secondary-btn {
  border-radius: 12px;
  padding: 0.75rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.primary-btn {
  background: #059669;
  color: #fff;
  border: none;
}
.secondary-btn {
  background: #fff;
  border: 1px solid #cbd5e1;
}
</style>
