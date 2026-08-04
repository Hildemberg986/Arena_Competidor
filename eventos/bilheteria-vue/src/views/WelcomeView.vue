<template>
  <div class="welcome-page">
    <!-- Tela de Boas-vindas -->
    <div v-if="!mostrarLogin" class="welcome-screen">
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
          <button class="welcome-btn primary" @click="abrirLogin('cliente')">
            <span class="btn-icon">🎫</span>
            <span class="btn-text">
              <strong>Comprar Ingressos</strong>
              <small>Ver eventos e garantir sua vaga</small>
            </span>
            <i class="fa-solid fa-chevron-right"></i>
          </button>

          <div v-if="mostrarAcessoRestrito" class="restricted-access">
            <div class="divider"><span>acesso restrito</span></div>

            <button class="welcome-btn admin" @click="abrirLogin('admin')">
              <span class="btn-icon">🔧</span>
              <span class="btn-text">
                <strong>Administração</strong>
                <small>Gerenciar campeonatos e lotes</small>
              </span>
              <i class="fa-solid fa-chevron-right"></i>
            </button>

            <button
              class="welcome-btn portaria"
              @click="abrirLogin('portaria')"
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

    <!-- Tela de Login -->
    <div v-else class="login-screen">
      <div class="auth-card">
        <button class="back-btn" @click="voltarWelcome">
          <i class="fa-solid fa-arrow-left"></i> Voltar
        </button>

        <div class="login-header">
          <span class="login-icon">{{ iconeModo }}</span>
          <h1>{{ tituloModo }}</h1>
          <p>{{ descricaoModo }}</p>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <label v-if="modo !== 'portaria'">
            E-mail
            <input
              v-model.trim="email"
              type="email"
              required
              :placeholder="placeholderEmail"
            />
          </label>

          <label v-if="modo !== 'portaria'">
            Senha
            <div class="password-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i
                  :class="
                    showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'
                  "
                ></i>
              </button>
            </div>
          </label>

          <label v-if="modo === 'portaria'">
            Código de acesso
            <input
              v-model.trim="codigoPortaria"
              type="password"
              placeholder="Código da portaria"
              autofocus
            />
          </label>

          <button class="primary-btn" type="submit" :disabled="loading">
            <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
            {{ loading ? "Entrando..." : textoBotao }}
          </button>
        </form>

        <p v-if="error" class="error-text">
          <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
        </p>

        <div v-if="modo === 'cliente'" class="auth-links">
          <router-link :to="{ name: 'cadastro', query: { redirect } }"
            >Criar conta</router-link
          >
          <router-link to="/">Voltar ao início</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/api";

const route = useRoute();
const router = useRouter();

const mostrarLogin = ref(false);
const mostrarAcessoRestrito = ref(false);
const modo = ref("cliente");
const email = ref("");
const password = ref("");
const codigoPortaria = ref("");
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const redirect = route.query.redirect || "/";

let clickCount = 0;
let clickTimer = null;
let longPressTimer = null;

onMounted(() => {
  const token = localStorage.getItem("access_token");
  const savedModo = localStorage.getItem("app_modo");

  // Se já tem modo salvo e token, redireciona direto
  if (token && savedModo) {
    modo.value = savedModo;
    redirecionarPorModo();
    return;
  }

  // Se já tem modo salvo mas sem token, já mostra o login do modo
  if (savedModo && !token) {
    modo.value = savedModo;
    mostrarLogin.value = true;
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

// ========== NAVEGAÇÃO ==========
function abrirLogin(tipo) {
  modo.value = tipo;
  localStorage.setItem("app_modo", tipo);
  mostrarLogin.value = true;
  error.value = "";
}

function voltarWelcome() {
  mostrarLogin.value = false;
  error.value = "";
}

// ========== COMPUTED ==========
const iconeModo = computed(() => {
  if (modo.value === "admin") return "🔧";
  if (modo.value === "portaria") return "🚪";
  return "🎫";
});
const tituloModo = computed(() => {
  if (modo.value === "admin") return "Administração";
  if (modo.value === "portaria") return "Portaria";
  return "Entrar";
});
const descricaoModo = computed(() => {
  if (modo.value === "admin") return "Acesso ao painel administrativo";
  if (modo.value === "portaria") return "Check-in e validação de ingressos";
  return "Acesse sua conta para comprar ingressos";
});
const placeholderEmail = computed(() =>
  modo.value === "admin" ? "admin@arena.com" : "seu@email.com",
);
const textoBotao = computed(() => {
  if (modo.value === "admin") return "Entrar no Painel";
  if (modo.value === "portaria") return "Acessar Portaria";
  return "Entrar";
});

// ========== LOGIN ==========
async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    let response;
    if (modo.value === "portaria") {
      response = await authService.loginPortaria(codigoPortaria.value);
      localStorage.setItem("adminToken", "portaria");
    } else {
      response = await authService.login(email.value, password.value);
      if (modo.value === "admin") {
        localStorage.setItem("adminToken", "implicito");
      }
    }

    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("token_type", response.token_type || "bearer");
    localStorage.setItem("user", JSON.stringify(response.user || {}));
    localStorage.setItem("app_modo", modo.value);

    redirecionarPorModo();
  } catch (err) {
    error.value =
      err?.response?.data?.detail || err.message || "Falha ao entrar";
  } finally {
    loading.value = false;
  }
}

function redirecionarPorModo() {
  setTimeout(() => {
    switch (modo.value) {
      case "admin":
        router.push("/admin");
        break;
      case "portaria":
        router.push("/admin/checkin");
        break;
      default:
        router.push(redirect || "/");
    }
  }, 300);
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

/* Welcome */
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

/* Login */
.login-screen {
  width: 100%;
  max-width: 400px;
  animation: slideUp 0.3s ease;
}
.auth-card {
  background: #fff;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
}
.back-btn {
  background: none;
  border: none;
  color: #64748b;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.login-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}
.login-header h1 {
  font-size: 1.4rem;
  margin: 0 0 0.25rem;
}
.login-header p {
  color: #64748b;
  font-size: 0.85rem;
}

.auth-form {
  display: grid;
  gap: 0.85rem;
}
label {
  display: grid;
  gap: 0.35rem;
  font-weight: 700;
  font-size: 0.85rem;
}
input {
  height: 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 0.85rem;
  font: inherit;
  font-size: 0.9rem;
  background: #fff;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}
input:focus {
  outline: none;
  border-color: #e62117;
  box-shadow: 0 0 0 3px rgba(230, 33, 23, 0.1);
}
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-wrapper input {
  flex: 1;
  padding-right: 2.75rem;
}
.toggle-password {
  position: absolute;
  right: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  color: #94a3b8;
}
.primary-btn {
  height: 48px;
  border: none;
  border-radius: 12px;
  background: #e62117;
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.primary-btn:disabled {
  opacity: 0.7;
}
.error-text {
  margin-top: 0.85rem;
  color: #b91c1c;
  font-weight: 600;
  font-size: 0.85rem;
  background: #fef2f2;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.auth-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
  font-size: 0.85rem;
}
.auth-links a {
  color: #e62117;
  text-decoration: none;
  font-weight: 700;
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  .auth-card {
    padding: 1.25rem;
    border-radius: 20px;
  }
}
</style>
