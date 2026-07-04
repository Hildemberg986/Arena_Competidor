<template>
  <div class="admin-login-page">
    <div class="admin-login-card">
      <p class="eyebrow">Arena Competidor</p>
      <h1>Login administrativo</h1>
      <p class="subtitle">Use o mesmo acesso do login normal e informe a chave administrativa.</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <label>
          E-mail
          <input v-model.trim="email" type="email" autocomplete="email" required>
        </label>

        <label>
          Senha
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
            >
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <svg
                v-if="showPassword"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </label>

        <label>
          Admin Token
          <input v-model.trim="adminToken" type="text" autocomplete="off" required>
        </label>

        <button class="primary-btn" type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar no admin' }}
        </button>
      </form>

      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="admin-links">
        <router-link to="/login">Login normal</router-link>
        <router-link to="/">Voltar</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/api'

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const adminToken = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const redirect = route.query.redirect || '/admin/campeonatos'

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const data = await authService.login(email.value, password.value)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('token_type', data.token_type || 'bearer')
    localStorage.setItem('cliente', JSON.stringify(data.cliente || {}))
    localStorage.setItem('user', JSON.stringify(data.cliente || { email: email.value }))
    localStorage.setItem('adminToken', adminToken.value.trim())
    router.push(String(redirect))
  } catch (err) {
    error.value = err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Falha ao entrar'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background:
    radial-gradient(circle at top, rgba(230, 33, 23, 0.14), transparent 34%),
    linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%);
}

.admin-login-card {
  width: min(100%, 440px);
  background: rgba(255, 255, 255, 0.96);
  border-radius: 28px;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
}

h1 {
  margin-top: 0.35rem;
  font-size: 2rem;
}

.subtitle {
  color: var(--text-light);
  margin: 0.35rem 0 1.25rem;
}

.login-form {
  display: grid;
  gap: 0.9rem;
}

label {
  display: grid;
  gap: 0.45rem;
  font-weight: 700;
  color: var(--text);
}

input {
  height: 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 0 0.9rem;
  font: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  flex: 1;
  padding-right: 3.5rem;
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  line-height: 1;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  background: #f1f5f9;
  color: #334155;
}

.toggle-password:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.primary-btn {
  height: 48px;
  border: none;
  border-radius: 12px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.primary-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.error-text {
  margin-top: 0.85rem;
  color: #b91c1c;
  font-weight: 700;
}

.admin-links {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.admin-links a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 520px) {
  .admin-login-card {
    padding: 1.5rem;
  }

  .admin-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>