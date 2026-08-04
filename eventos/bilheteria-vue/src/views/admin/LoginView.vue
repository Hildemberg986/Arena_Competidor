<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <p class="eyebrow">Arena Competidor</p>
      <h1>Login administrativo</h1>
      <p class="subtitle">
        Use o mesmo acesso do login normal e informe a chave administrativa.
      </p>

      <form class="login-form" @submit.prevent="handleLogin">
        <label>
          E-mail
          <input
            v-model.trim="email"
            type="email"
            autocomplete="email"
            required
            placeholder="seu@email.com"
          />
        </label>

        <label>
          Senha
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
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

        <label>
          Admin Token
          <input
            v-model.trim="adminToken"
            type="text"
            autocomplete="off"
            required
            placeholder="Token administrativo"
          />
        </label>

        <button class="primary-btn" type="submit" :disabled="auth.loading">
          <i v-if="auth.loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ auth.loading ? "Entrando..." : "Entrar no admin" }}
        </button>
      </form>

      <p v-if="auth.error" class="error-text">
        <i class="fa-solid fa-circle-exclamation"></i> {{ auth.error }}
      </p>

      <div class="admin-links">
        <button class="link-btn" @click="escolherOutroAcesso">
          ← Escolher outro acesso
        </button>
        <router-link to="/">Voltar ao site</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const adminToken = ref("");
const showPassword = ref(false);

async function handleLogin() {
  try {
    await auth.loginAdmin(email.value, password.value, adminToken.value);
    router.push("/admin");
  } catch {
    // erro já está em auth.error
  }
}

function escolherOutroAcesso() {
  localStorage.removeItem("app_modo");
  auth.logout();
  router.push("/bem-vindo");
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background:
    radial-gradient(circle at top, rgba(230, 33, 23, 0.12), transparent 34%),
    linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}
.admin-login-card {
  width: min(100%, 420px);
  background: rgba(255, 255, 255, 0.96);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.15);
  animation: fadeUp 0.4s ease;
}
.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
}
h1 {
  margin-top: 0.3rem;
  font-size: 1.5rem;
}
.subtitle {
  color: var(--text-light);
  margin: 0.3rem 0 1.25rem;
  font-size: 0.85rem;
  line-height: 1.4;
}

.login-form {
  display: grid;
  gap: 0.85rem;
}
label {
  display: grid;
  gap: 0.35rem;
  font-weight: 700;
  color: var(--text);
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
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(230, 33, 23, 0.1);
}
input::placeholder {
  color: #94a3b8;
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
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.toggle-password:active {
  background: #f1f5f9;
  color: #64748b;
}

.primary-btn {
  height: 48px;
  border: none;
  border-radius: 12px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  -webkit-tap-highlight-color: transparent;
}
.primary-btn:active {
  background: #c81e14;
}
.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-text {
  margin-top: 0.85rem;
  color: #b91c1c;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #fef2f2;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
}

.admin-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1.25rem;
  font-size: 0.85rem;
}
.admin-links a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
}
.admin-links a:active {
  color: #c81e14;
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  font: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
.link-btn:active {
  color: #c81e14;
}

@media (max-width: 480px) {
  .admin-login-page {
    padding: 0.75rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
  .admin-login-card {
    padding: 1.5rem;
    border-radius: 20px;
  }
  h1 {
    font-size: 1.3rem;
  }
  .admin-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
