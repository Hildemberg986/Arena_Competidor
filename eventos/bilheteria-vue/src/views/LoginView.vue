<template>
  <div class="auth-page">
    <div class="auth-card">
      <p class="eyebrow">Arena Competidor</p>
      <h1>Entrar</h1>
      <p class="subtitle">Acesse sua conta para finalizar a inscrição.</p>

      <form class="auth-form" @submit.prevent="handleLogin">
        <label>
          E-mail
          <input v-model.trim="email" type="email" autocomplete="email" required>
        </label>

        <label>
          Senha
          <input v-model="password" type="password" autocomplete="current-password" required>
        </label>

        <button class="primary-btn" type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p v-if="error" class="error-text">{{ error }}</p>

      <div class="auth-links">
        <router-link :to="{ name: 'cadastro', query: { redirect } }">Criar conta</router-link>
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
const loading = ref(false)
const error = ref('')
const redirect = route.query.redirect || '/'

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const data = await authService.login(email.value, password.value)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('token_type', data.token_type || 'bearer')
    localStorage.setItem('cliente', JSON.stringify(data.cliente || {}))
    localStorage.setItem('user', JSON.stringify(data.cliente || { email: email.value }))
    router.push(String(redirect))
  } catch (err) {
    error.value = err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Falha ao entrar'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: grid; place-items: center; padding: 1rem; background: linear-gradient(135deg, #f8fafc, #eef2ff); }
.auth-card { width: min(100%, 420px); background: #fff; border-radius: 24px; padding: 2rem; box-shadow: 0 24px 60px rgba(15, 23, 42, .12); }
.eyebrow { color: var(--primary); font-weight: 800; text-transform: uppercase; letter-spacing: .08em; font-size: .78rem; }
h1 { margin-top: .35rem; font-size: 2rem; }
.subtitle { color: var(--text-light); margin: .35rem 0 1.25rem; }
.auth-form { display: grid; gap: .9rem; }
label { display: grid; gap: .45rem; font-weight: 700; color: var(--text); }
input { height: 46px; border: 1px solid #cbd5e1; border-radius: 12px; padding: 0 .9rem; font: inherit; }
.primary-btn { height: 48px; border: none; border-radius: 12px; background: var(--primary); color: #fff; font-weight: 800; cursor: pointer; }
.primary-btn:disabled { opacity: .75; cursor: not-allowed; }
.error-text { margin-top: .85rem; color: #b91c1c; font-weight: 700; }
.auth-links { display: flex; justify-content: space-between; margin-top: 1rem; font-size: .9rem; }
a { color: var(--primary); text-decoration: none; font-weight: 700; }
</style>