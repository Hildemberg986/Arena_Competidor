<template>
  <div class="welcome-page">
    <div class="welcome-screen">
      <div class="welcome-content">
        <h1>Bem-vindo ao Arena Competidor</h1>
        <p>Compre ingressos, gerencie eventos ou faça check-in na portaria.</p>

        <button class="welcome-btn" @click="selecionarModo('cliente')">
          <span>Vamos lá</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>

        <p class="trocar-modulo" @click="clicksNoTexto">
          {{ mostrarOpcoes ? "Esconder" : "" }}
        </p>

        <div v-if="mostrarOpcoes" class="opcoes-extras">
          <button class="welcome-btn admin" @click="selecionarModo('admin')">
            <span class="btn-icon">🔧</span>
            Administração
          </button>
          <button
            class="welcome-btn portaria"
            @click="selecionarModo('portaria')"
          >
            <span class="btn-icon">🚪</span>
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

let clickCount = 0;
let clickTimer = null;

function clicksNoTexto() {
  clickCount++;
  clearTimeout(clickTimer);
  if (clickCount >= 5) {
    mostrarOpcoes.value = !mostrarOpcoes.value;
    clickCount = 0;
  }
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 1000);
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
  text-align: center;
}
.welcome-screen {
  width: 100%;
  max-width: 380px;
}
.welcome-content {
  display: grid;
  gap: 1.5rem;
}
h1 {
  font-size: 1.5rem;
  font-weight: 800;
}
p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.welcome-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 16px;
  background: #e62117;
  color: #fff;
  font: inherit;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.welcome-btn:active {
  filter: brightness(0.9);
}
.welcome-btn.admin {
  background: #6366f1;
  width: 100%;
}
.welcome-btn.portaria {
  background: #059669;
  width: 100%;
}

.trocar-modulo {
  font-size: 0.7rem;
  color: transparent;
  cursor: default;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  height: 20px;
}

.opcoes-extras {
  display: grid;
  gap: 0.5rem;
}
</style>
