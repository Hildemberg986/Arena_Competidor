<template>
  <div class="welcome-page">
    <div class="welcome-screen">
      <div class="welcome-content">
        <div class="welcome-brand">
          <img
            src="../../../../img/arena03.png"
            alt="Arena Competidor"
            class="welcome-logo"
          />
          <h1>Arena Competidor</h1>
          <p>Escolha como deseja acessar</p>
        </div>

        <div class="welcome-actions">
          <button
            class="welcome-btn primary"
            @click="selecionarModo('cliente')"
          >
            <span class="btn-icon">🎫</span>
            <span class="btn-text">
              <strong>Comprar Ingressos</strong>
              <small>Login do cliente</small>
            </span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>

          <button class="welcome-btn admin" @click="selecionarModo('admin')">
            <span class="btn-icon">🔧</span>
            <span class="btn-text">
              <strong>Administração</strong>
              <small>Login administrativo</small>
            </span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>

          <button
            class="welcome-btn portaria"
            @click="selecionarModo('portaria')"
          >
            <span class="btn-icon">🚪</span>
            <span class="btn-text">
              <strong>Portaria</strong>
              <small>Check-in de ingressos</small>
            </span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  // Se já escolheu antes E está logado, vai direto
  const token = localStorage.getItem("access_token");
  const savedModo = localStorage.getItem("app_modo");

  if (token && savedModo) {
    redirecionarParaLogin(savedModo);
  }
});

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
