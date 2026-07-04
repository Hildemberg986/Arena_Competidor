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
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
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

        <button class="primary-btn" type="submit" :disabled="loading">
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ loading ? "Entrando..." : "Entrar no admin" }}
        </button>
      </form>

      <p v-if="error" class="error-text">
        <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
      </p>

      <div class="admin-links">
        <router-link to="/login">← Login normal</router-link>
        <router-link to="/">Voltar ao site</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "@/services/api";

const router = useRouter();
const route = useRoute();
const email = ref("");
const password = ref("");
const adminToken = ref("");
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const redirect = route.query.redirect || "/admin/campeonatos";

async function handleLogin() {
  loading.value = true;
  error.value = "";

  try {
    const data = await authService.login(email.value, password.value);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("token_type", data.token_type || "bearer");
    localStorage.setItem("cliente", JSON.stringify(data.cliente || {}));
    localStorage.setItem(
      "user",
      JSON.stringify(data.cliente || { email: email.value }),
    );
    localStorage.setItem("adminToken", adminToken.value.trim());
    router.push(String(redirect));
  } catch (err) {
    error.value =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err.message ||
      "Falha ao entrar";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* ============================================ */
/* GERAL */
/* ============================================ */
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

/* ============================================ */
/* FORM */
/* ============================================ */
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
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
  -webkit-appearance: none;
  -moz-appearance: none;
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

/* ============================================ */
/* ERROR */
/* ============================================ */
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
.error-text i {
  font-size: 0.9rem;
}

/* ============================================ */
/* LINKS */
/* ============================================ */
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

/* ============================================ */
/* MOBILE */
/* ============================================ */
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
