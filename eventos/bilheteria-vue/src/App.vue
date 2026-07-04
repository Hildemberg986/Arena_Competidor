<template>
  <div id="app">
    <header v-if="!isAdminRoute" class="app-header">
      <div class="logo-box">
        <img src="../../../img/arena03.png" alt="Arena Competidor" />
      </div>
      <div class="header-actions">
        <router-link
          to="/"
          class="btn-header"
          :class="{ active: $route.name === 'home' }"
        >
          <i class="fa-solid fa-ticket"></i> Ingressos
        </router-link>
        <a href="/" class="btn-header">
          <i class="fa-solid fa-home"></i> Início
        </a>

        <router-link v-if="!isAuthenticated" :to="{ name: 'login' }" class="btn-header login-btn">
          <i class="fa-solid fa-right-to-bracket"></i> Login
        </router-link>

        <div v-else class="user-menu-wrap">
          <button class="user-menu-trigger" type="button" @click.stop="toggleUserMenu">
            <img
              src="https://img.icons8.com/?size=100&id=85147&format=png&color=000000"
              alt="Conta do usuário"
            />
          </button>

          <div v-if="userMenuOpen" class="user-dropdown" @click.stop>
            <div class="user-summary">
              <strong>{{ displayName }}</strong>
              <span>{{ userProfile?.email }}</span>
            </div>

            <router-link class="dropdown-action link-action" :to="{ name: 'meus-ingressos' }">
              <i class="fa-solid fa-ticket"></i>
              Ver meus ingressos
            </router-link>

            <button class="dropdown-action danger" type="button" @click="handleLogout">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>

    <main v-if="!isAdminRoute" class="container">
      <router-view />
    </main>

    <router-view v-else />

    <footer v-if="!isAdminRoute" class="app-footer">
      Arena Competidor &copy; 2026 &bull; Todos os direitos reservados &bull;
      Bilheteria Digital
    </footer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useEventsStore } from "@/stores/events";
import { authService } from "@/services/api";

const eventsStore = useEventsStore();
const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const isAuthenticated = ref(false)
const userProfile = ref(null)
const userMenuOpen = ref(false)

const displayName = computed(() => {
  const fullName = userProfile.value?.nome_completo || userProfile.value?.name || ''
  if (fullName) {
    return fullName.split(' ')[0]
  }

  return userProfile.value?.email || 'Conta'
})

function closeMenus() {
  userMenuOpen.value = false
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

async function loadAuthState() {
  const token = localStorage.getItem('access_token')
  if (!token) {
    isAuthenticated.value = false
    userProfile.value = null
    return
  }

  isAuthenticated.value = true

  try {
    const response = await authService.me()
    userProfile.value = response?.data || response
  } catch (error) {
    handleLogout()
  }
}

function handleLogout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('token_type')
  localStorage.removeItem('cliente')
  localStorage.removeItem('user')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('auth_token')
  isAuthenticated.value = false
  userProfile.value = null
  userMenuOpen.value = false
}

function handleDocumentClick() {
  closeMenus()
}

onMounted(() => {
  eventsStore.fetchEvents();
  loadAuthState();
  document.addEventListener('click', handleDocumentClick)
});

watch(
  () => route.fullPath,
  () => {
    loadAuthState();
    closeMenus();
  }
);

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
});
</script>

<style>
.link-action{
  text-decoration: none;
}
:root {
  --primary: #e62117;
  --primary-soft: #fff1f0;
  --bg: #f8fafc;
  --card: #ffffff;
  --text: #0f172a;
  --text-light: #64748b;
  --shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    "Inter",
    system-ui,
    -apple-system,
    sans-serif;
  background-color: var(--bg);
  color: var(--text);
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--card);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.logo-box {
  max-width: 140px;
}

.logo-box img {
  width: 100%;
  height: auto;
  display: block;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  position: relative;
}

.btn-header {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  background: var(--card);
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-header:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-header.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.login-btn {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.login-btn:hover {
  filter: brightness(0.96);
  color: white;
}

.user-menu-wrap {
  position: relative;
}

.user-menu-trigger {
  width: 44px;
  height: 44px;
  border: 2px solid #e2e8f0;
  border-radius: 999px;
  background: var(--card);
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
}

.user-menu-trigger img {
  width: 24px;
  height: 24px;
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.75rem);
  width: 280px;
  background: var(--card);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 0.9rem;
  z-index: 1200;
  display: grid;
  gap: 0.65rem;
}

.user-summary {
  display: grid;
  gap: 0.15rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid #e2e8f0;
}

.user-summary strong {
  font-size: 0.95rem;
}

.user-summary span {
  color: var(--text-light);
  font-size: 0.85rem;
  word-break: break-word;
}

.dropdown-action {
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: #f8fafc;
  color: var(--text);
  padding: 0.85rem 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.dropdown-action.danger {
  color: #b91c1c;
}

.tickets-panel {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.34);
  display: grid;
  place-items: start end;
  padding: 6.5rem 1rem 1rem;
  z-index: 1150;
}

.tickets-panel-card {
  width: min(100%, 420px);
  background: var(--card);
  border-radius: 22px;
  box-shadow: var(--shadow);
  padding: 1rem;
  display: grid;
  gap: 0.9rem;
}

.tickets-panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.panel-kicker {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
}

.tickets-panel-header h2 {
  font-size: 1.1rem;
  margin-top: 0.2rem;
}

.panel-close {
  border: 0;
  background: #e2e8f0;
  color: var(--text);
  border-radius: 999px;
  padding: 0.5rem 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.panel-state {
  color: var(--text-light);
  font-weight: 600;
}

.panel-state.error {
  color: #b91c1c;
}

.tickets-list {
  list-style: none;
  display: grid;
  gap: 0.75rem;
}

.ticket-item {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0.9rem;
  display: grid;
  gap: 0.2rem;
}

.ticket-item strong {
  font-size: 0.95rem;
}

.ticket-item span {
  color: var(--text-light);
  font-size: 0.85rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  flex: 1;
  width: 100%;
}

.app-footer {
  text-align: center;
  padding: 3rem 1rem 1.5rem;
  color: var(--text-light);
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: auto;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .app-header {
    padding: 1rem;
  }

  .user-dropdown {
    width: min(280px, calc(100vw - 2rem));
  }

  .tickets-panel {
    place-items: end center;
    padding-top: 5.5rem;
  }

  .tickets-panel-card {
    width: 100%;
  }
}
</style>
