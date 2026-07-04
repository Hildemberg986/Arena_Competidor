<template>
  <div class="admin-shell">
    <!-- Mobile Header -->
    <header class="admin-mobile-header">
      <div class="mobile-brand">
        <p class="eyebrow">Arena Competidor</p>
        <h1>Painel administrativo</h1>
      </div>
      <button
        class="menu-toggle"
        @click="menuAberto = !menuAberto"
        aria-label="Menu"
      >
        <i :class="menuAberto ? 'fa-solid fa-times' : 'fa-solid fa-bars'"></i>
      </button>
    </header>

    <!-- Overlay mobile -->
    <div
      v-if="menuAberto"
      class="sidebar-overlay"
      @click="menuAberto = false"
    ></div>

    <!-- Sidebar -->
    <aside :class="['admin-sidebar', { 'sidebar-open': menuAberto }]">
      <div class="admin-brand">
        <p class="eyebrow">Arena Competidor</p>
        <h1>Painel administrativo</h1>
        <p>Gerencie campeonatos, lotes, tipos de inscrição e preços.</p>
      </div>

      <nav class="admin-nav">
        <router-link
          :to="{ name: 'admin-campeonatos' }"
          @click="menuAberto = false"
          >Campeonatos</router-link
        >
        <router-link :to="{ name: 'admin-lotes' }" @click="menuAberto = false"
          >Lotes</router-link
        >
        <router-link
          :to="{ name: 'admin-tipos-inscricao' }"
          @click="menuAberto = false"
          >Tipos de inscrição</router-link
        >
        <router-link :to="{ name: 'admin-precos' }" @click="menuAberto = false"
          >Preços</router-link
        >
        <router-link
          :to="{ name: 'admin-pagamento-manual' }"
          @click="menuAberto = false"
          >Pagamento manual</router-link
        >
        <router-link :to="{ name: 'admin-checkin' }" @click="menuAberto = false"
          >Check-in</router-link
        >
      </nav>

      <div class="admin-actions">
        <router-link class="secondary-link" to="/" @click="menuAberto = false"
          >Voltar ao site</router-link
        >
        <button type="button" class="logout-btn" @click="handleLogout">
          Sair do admin
        </button>
      </div>
    </aside>

    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const menuAberto = ref(false);

function handleLogout() {
  localStorage.removeItem("adminToken");
  router.push({ name: "admin-login" });
}
</script>

<style scoped>
/* ============================================ */
/* GERAL */
/* ============================================ */
.admin-shell {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

/* ============================================ */
/* MOBILE HEADER */
/* ============================================ */
.admin-mobile-header {
  display: none;
  position: sticky;
  top: 0;
  max-height: 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  padding: 0.75rem 1rem;
  padding-top: max(0.75rem, env(safe-area-inset-top));
  border-bottom: 1px solid #e2e8f0;
  justify-content: space-between;
  align-items: center;
}
.mobile-brand h1 {
  font-size: 1rem;
  margin: 0;
}
.mobile-brand .eyebrow {
  font-size: 0.65rem;
}
.menu-toggle {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  -webkit-tap-highlight-color: transparent;
}

/* Overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 90;
  animation: fadeIn 0.2s;
}

/* ============================================ */
/* SIDEBAR */
/* ============================================ */
.admin-sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  min-height: 100dvh;
  max-height: 100dvh;
  overflow-y: auto;
  padding: 1.5rem 1.25rem;
  padding-top: max(1.5rem, env(safe-area-inset-top));
  background: rgba(255, 255, 255, 0.9);
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(16px);
}
.admin-brand h1 {
  margin: 0.35rem 0 0.5rem;
  font-size: 1.6rem;
  line-height: 1.1;
}
.admin-brand p {
  color: var(--text-light);
  font-size: 0.85rem;
}
.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
}

.admin-nav {
  display: grid;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.admin-nav a,
.secondary-link,
.logout-btn {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  padding: 0.75rem 0.9rem;
  font: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.admin-nav a {
  background: #fff;
  color: var(--text);
}
.admin-nav a:active {
  background: #f8fafc;
}
.admin-nav a.router-link-active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.admin-actions {
  display: grid;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.secondary-link {
  background: #fff;
  color: var(--text);
  text-align: center;
}
.logout-btn {
  background: #fff5f5;
  color: #b91c1c;
  cursor: pointer;
}
.logout-btn:active {
  background: #fee2e2;
}

.admin-content {
  padding: 1.5rem;
  padding-top: max(1.5rem, env(safe-area-inset-top));
}

/* ============================================ */
/* MOBILE */
/* ============================================ */
@media (max-width: 960px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  .admin-mobile-header {
    display: flex;
  }
  .sidebar-overlay {
    display: block;
  }

  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    z-index: 95;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
    padding-top: max(1.5rem, env(safe-area-inset-top));
  }
  .admin-sidebar.sidebar-open {
    transform: translateX(0);
  }
  .admin-content {
    padding: 0.75rem;
    padding-top: max(0.75rem, env(safe-area-inset-top));
  }
}

/* ============================================ */
/* MOBILE PEQUENO */
/* ============================================ */
@media (max-width: 480px) {
  .admin-sidebar {
    width: 85vw;
    max-width: 300px;
    padding: 1rem 1rem;
  }
  .admin-brand h1 {
    font-size: 1.3rem;
  }
  .admin-nav a,
  .secondary-link,
  .logout-btn {
    padding: 0.65rem 0.8rem;
    font-size: 0.85rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>