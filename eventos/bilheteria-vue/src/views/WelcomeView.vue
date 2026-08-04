<template>
  <div class="welcome-page">
    <div class="welcome-screen">
      <div class="welcome-content">
        <h1>Bem-vindo ao Arena Competidor</h1>
        <p>Compre ingressos, gerencie eventos ou faça check-in na portaria.</p>

        <button
          class="welcome-btn"
          ref="btnVamos"
          @click="irParaCliente"
          @mousedown="startLongPress"
          @mouseup="cancelLongPress"
          @mouseleave="cancelLongPress"
          @touchstart="startLongPress"
          @touchend="cancelLongPress"
          @touchmove="cancelLongPress"
        >
          Vamos lá
        </button>

        <div v-if="mostrarOpcoes" class="opcoes-extras">
          <button
            class="welcome-btn secondary"
            @click="selecionarModo('admin')"
          >
            Administração
          </button>
          <button
            class="welcome-btn secondary"
            @click="selecionarModo('portaria')"
          >
            Portaria
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const mostrarOpcoes = ref(false);
let longPressTimer = null;
let wasLongPress = false;

function startLongPress(e) {
  wasLongPress = false;
  longPressTimer = setTimeout(() => {
    wasLongPress = true;
    mostrarOpcoes.value = !mostrarOpcoes.value;
  }, 1500);
}

function cancelLongPress() {
  clearTimeout(longPressTimer);
}

function irParaCliente(e) {
  // Se foi long press, não faz nada
  if (wasLongPress) {
    wasLongPress = false;
    return;
  }
  selecionarModo("cliente");
}

function selecionarModo(tipo) {
  localStorage.setItem("app_modo", tipo);
  switch (tipo) {
    case "admin":
      router.push("/admin/login");
      break;
    case "portaria":
      router.push("/portaria/login");
      break;
    default:
      localStorage.setItem("app_modo", "cliente");
      router.push("/");
  }
}
</script>

<style scoped>
.welcome-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  background: #fff;
  padding: 1.5rem;
  text-align: center;
}
.welcome-screen {
  width: 100%;
  max-width: 360px;
}
.welcome-content {
  display: grid;
  gap: 1.25rem;
}
h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}
p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.welcome-btn {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: 12px;
  background: #e62117;
  color: #fff;
  font: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.welcome-btn:active {
  filter: brightness(0.9);
}

.welcome-btn.secondary {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}
.welcome-btn.secondary:active {
  background: #e2e8f0;
}

.opcoes-extras {
  display: grid;
  gap: 0.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
