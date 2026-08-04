<template>
  <div class="welcome-page">
    <div class="welcome-screen">
      <div class="welcome-content">
        <div class="welcome-brand">
          <img
            src="../../../../img/arena03.png"
            alt="Arena Competidor"
            class="welcome-logo"
            @click="clicksNaLogo"
            @touchstart.prevent="startLongPress"
            @touchend.prevent="cancelLongPress"
            @mousedown.prevent="startLongPress"
            @mouseup.prevent="cancelLongPress"
          />
          <h1>Arena Competidor</h1>
          <p>Bilheteria Digital</p>
        </div>

        <div class="welcome-actions">
          <!-- Cliente: sempre visível -->
          <button
            class="welcome-btn primary"
            @click="selecionarModo('cliente')"
          >
            <span class="btn-icon">🎫</span>
            <span class="btn-text">
              <strong>Comprar Ingressos</strong>
              <small>Ver eventos e garantir sua vaga</small>
            </span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>

          <!-- Admin e Portaria: escondidos -->
          <div v-if="mostrarAcessoRestrito" class="restricted-access">
            <div class="divider"><span>acesso restrito</span></div>

            <button class="welcome-btn admin" @click="selecionarModo('admin')">
              <span class="btn-icon">🔧</span>
              <span class="btn-text">
                <strong>Administração</strong>
                <small>Gerenciar campeonatos e lotes</small>
              </span>
              <i class="fa-solid fa-chevron-right"></i>
            </button>

            <button
              class="welcome-btn portaria"
              @click="selecionarModo('portaria')"
            >
              <span class="btn-icon">🚪</span>
              <span class="btn-text">
                <strong>Portaria / Check-in</strong>
                <small>Validar ingressos na entrada</small>
              </span>
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <p class="welcome-hint" v-if="!mostrarAcessoRestrito">
          Toque na logo 5x para acesso administrativo
        </p>
        <p class="welcome-hint" v-else>Toque na logo novamente para esconder</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const mostrarAcessoRestrito = ref(false);

let clickCount = 0;
let clickTimer = null;
let longPressTimer = null;

onMounted(() => {
  // Se já tem modo salvo, redireciona direto pro login certo
  const savedModo = localStorage.getItem("app_modo");
  if (savedModo) {
    redirecionarParaLogin(savedModo);
  }
});

// ========== GESTOS ==========
function clicksNaLogo() {
  clickCount++;
  clearTimeout(clickTimer);
  if (clickCount >= 5) {
    mostrarAcessoRestrito.value = !mostrarAcessoRestrito.value;
    clickCount = 0;
  }
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 1000);
}

function startLongPress() {
  longPressTimer = setTimeout(() => {
    mostrarAcessoRestrito.value = !mostrarAcessoRestrito.value;
  }, 2000);
}

function cancelLongPress() {
  clearTimeout(longPressTimer);
}

// ========== SELEÇÃO DE MODO ==========
function selecionarModo(tipo) {
  localStorage.setItem("app_modo", tipo);
  redirecionarParaLogin(tipo);
}

function redirecionarParaLogin(tipo) {
  switch (tipo) {
    case "admin":
      router.push("/admin/login");
      break;
    case "portaria":
      router.push("/admin/login?modo=portaria");
      break;
    default:
      router.push("/login");
  }
}
</script>

<style scoped>
.welcome-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  padding: 1rem;
}

.welcome-screen {
  width: 100%;
  max-width: 420px;
  animation: fadeIn 0.5s ease;
}
.welcome-content {
  display: grid;
  gap: 2rem;
  text-align: center;
}
.welcome-brand {
  display: grid;
  gap: 0.5rem;
  justify-items: center;
}
.welcome-logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(230, 33, 23, 0.2);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.welcome-logo:active {
  transform: scale(0.95);
}
.welcome-brand h1 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
}
.welcome-brand p {
  color: #64748b;
  font-size: 0.95rem;
}

.welcome-actions {
  display: grid;
  gap: 0.75rem;
}
.welcome-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.welcome-btn:active {
  transform: scale(0.98);
}
.welcome-btn .btn-icon {
  font-size: 2rem;
  flex-shrink: 0;
}
.welcome-btn .btn-text {
  flex: 1;
}
.welcome-btn .btn-text strong {
  display: block;
  font-size: 0.95rem;
}
.welcome-btn .btn-text small {
  color: #64748b;
  font-size: 0.78rem;
}
.welcome-btn .fa-chevron-right {
  color: #94a3b8;
}
.welcome-btn.primary {
  border-color: #e62117;
  background: #fff5f5;
}
.welcome-btn.admin {
  border-color: #6366f1;
  background: #f5f5ff;
}
.welcome-btn.portaria {
  border-color: #059669;
  background: #f0fdf4;
}

.divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.divider span {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 700;
  letter-spacing: 0.05em;
}
.welcome-hint {
  font-size: 0.7rem;
  color: #94a3b8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .welcome-brand h1 {
    font-size: 1.5rem;
  }
  .welcome-logo {
    width: 65px;
    height: 65px;
  }
  .welcome-btn {
    padding: 1rem;
  }
}
</style>
