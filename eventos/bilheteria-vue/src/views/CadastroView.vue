<template>
  <div class="auth-page">
    <div class="auth-card">
      <p class="eyebrow">Arena Competidor</p>
      <h1>Criar conta</h1>
      <p class="subtitle">Cadastre-se para continuar a inscrição.</p>

      <form class="auth-form" @submit.prevent="handleRegister">
        <label>
          Nome
          <input v-model.trim="name" type="text" autocomplete="name" required>
        </label>

        <label>
          E-mail
          <input v-model.trim="email" type="email" autocomplete="email" required>
        </label>

        <label>
          Senha
          <input v-model="password" type="password" autocomplete="new-password" required>
        </label>

        <button class="primary-btn" type="submit">Criar conta</button>
      </form>

      <div class="auth-links">
        <router-link :to="{ name: 'login', query: { redirect } }">Já tenho conta</router-link>
        <router-link to="/">Voltar</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const name = ref('')
const email = ref('')
const password = ref('')
const redirect = route.query.redirect || '/'

function handleRegister() {
  localStorage.setItem('token', 'local-token')
  localStorage.setItem('user', JSON.stringify({ name: name.value, email: email.value }))
  router.push(String(redirect))
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
.auth-links { display: flex; justify-content: space-between; margin-top: 1rem; font-size: .9rem; }
a { color: var(--primary); text-decoration: none; font-weight: 700; }
</style>