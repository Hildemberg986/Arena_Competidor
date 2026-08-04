<template>
  <div id="app">
    <header v-if="!isAdminRoute && !isPortariaRoute" class="app-header">
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

        <router-link
          v-if="!auth.isAuthenticated"
          :to="{ name: 'login' }"
          class="btn-header login-btn"
        >
          <i class="fa-solid fa-right-to-bracket"></i> Login
        </router-link>

        <div v-else class="user-menu-wrap">
          <button
            class="user-menu-trigger"
            type="button"
            @click.stop="toggleUserMenu"
          >
            <img
              src="https://img.icons8.com/?size=100&id=85147&format=png&color=000000"
              alt="Conta"
            />
          </button>

          <div v-if="userMenuOpen" class="user-dropdown" @click.stop>
            <div class="user-summary">
              <strong>{{ auth.userName || "Usuário" }}</strong>
              <span>{{ auth.userEmail }}</span>
            </div>

            <router-link
              class="dropdown-action link-action"
              :to="{ name: 'meus-ingressos' }"
            >
              <i class="fa-solid fa-ticket"></i> Ver meus ingressos
            </router-link>

            <button
              class="dropdown-action danger"
              type="button"
              @click="handleLogout"
            >
              <i class="fa-solid fa-arrow-right-from-bracket"></i> Sair
            </button>
          </div>
        </div>
      </div>
    </header>

    <main v-if="!isAdminRoute && !isPortariaRoute" class="container">
      <router-view />
    </main>

    <router-view v-else />

    <footer v-if="!isAdminRoute && !isPortariaRoute" class="app-footer">
      Arena Competidor &copy; 2026 &bull; Todos os direitos reservados &bull;
      Bilheteria Digital
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useEventsStore } from "@/stores/events";
import { useAuthStore } from "@/stores/auth";

const eventsStore = useEventsStore();
const auth = useAuthStore();
const route = useRoute();

const isAdminRoute = computed(() => route.path.startsWith("/admin"));
const isPortariaRoute = computed(() => route.path.startsWith("/portaria"));
const userMenuOpen = ref(false);

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
}
function closeMenus() {
  userMenuOpen.value = false;
}

function handleLogout() {
  auth.logout();
  closeMenus();
}

watch(
  () => route.fullPath,
  () => closeMenus(),
);
eventsStore.fetchEvents();
</script>

<style>
/* ============================================ */
/* VARIÁVEIS */
/* ============================================ */
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
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.link-action {
  text-decoration: none;
}

/* HEADER */
.app-header {
  background: var(--card);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.logo-box {
  max-width: 110px;
}
.logo-box img {
  width: 100%;
  height: auto;
  display: block;
}
.header-actions {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  position: relative;
}

.btn-header {
  padding: 0.4rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  background: var(--card);
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  text-decoration: none;
  white-space: nowrap;
}
.btn-header:active {
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
.login-btn:active {
  filter: brightness(0.9);
}

/* USER MENU */
.user-menu-wrap {
  position: relative;
}
.user-menu-trigger {
  width: 38px;
  height: 38px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  background: var(--card);
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
}
.user-menu-trigger img {
  width: 20px;
  height: 20px;
}
.user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 260px;
  background: var(--card);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 0.75rem;
  z-index: 1200;
  display: grid;
  gap: 0.5rem;
}
.user-summary {
  display: grid;
  gap: 0.1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.user-summary strong {
  font-size: 0.9rem;
}
.user-summary span {
  color: var(--text-light);
  font-size: 0.8rem;
  word-break: break-word;
}
.dropdown-action {
  width: 100%;
  border: 0;
  border-radius: 10px;
  background: #f8fafc;
  color: var(--text);
  padding: 0.7rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.dropdown-action:active {
  background: #f1f5f9;
}
.dropdown-action.danger {
  color: #b91c1c;
}

/* CONTAINER */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0.75rem;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

/* FOOTER */
.app-footer {
  text-align: center;
  padding: 2rem 1rem 1.5rem;
  color: var(--text-light);
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: auto;
}

/* TABLET+ */
@media (min-width: 769px) {
  .app-header {
    padding: 1rem 1.5rem;
  }
  .logo-box {
    max-width: 140px;
  }
  .btn-header {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
  .header-actions {
    gap: 0.75rem;
  }
  .user-menu-trigger {
    width: 44px;
    height: 44px;
  }
  .user-menu-trigger img {
    width: 24px;
    height: 24px;
  }
  .user-dropdown {
    width: 280px;
  }
  .container {
    padding: 2rem 1.5rem;
  }
  .app-footer {
    font-size: 0.75rem;
  }
}

/* MOBILE */
@media (max-width: 480px) {
  .btn-header {
    font-size: 0.7rem;
    padding: 0.35rem 0.6rem;
    gap: 0.25rem;
  }
  .btn-header i {
    font-size: 0.7rem;
  }
  .user-dropdown {
    width: calc(100vw - 2rem);
    right: -0.5rem;
  }
}
</style>
