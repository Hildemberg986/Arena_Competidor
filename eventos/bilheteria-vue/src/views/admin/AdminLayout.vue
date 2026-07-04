<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <p class="eyebrow">Arena Competidor</p>
        <h1>Painel administrativo</h1>
        <p>Gerencie campeonatos, lotes, tipos de inscrição e preços.</p>
      </div>

      <nav class="admin-nav">
        <router-link :to="{ name: 'admin-campeonatos' }"
          >Campeonatos</router-link
        >
        <router-link :to="{ name: 'admin-lotes' }">Lotes</router-link>
        <router-link :to="{ name: 'admin-tipos-inscricao' }"
          >Tipos de inscrição</router-link
        >
        <router-link :to="{ name: 'admin-precos' }">Preços</router-link>
        <router-link :to="{ name: 'admin-pagamento-manual' }"
          >Pagamento manual</router-link
        >
        <router-link :to="{ name: 'admin-checkin' }"
          >Check-in</router-link
        >
      </nav>

      <div class="admin-actions">
        <router-link class="secondary-link" to="/">Voltar ao site</router-link>
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
import { useRouter } from "vue-router";

const router = useRouter();

function handleLogout() {
  localStorage.removeItem("adminToken");
  router.push({ name: "admin-login" });
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  background:
    radial-gradient(
      circle at top left,
      rgba(230, 33, 23, 0.12),
      transparent 32%
    ),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.admin-sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(16px);
}

.admin-brand h1 {
  margin: 0.35rem 0 0.5rem;
  font-size: 1.8rem;
  line-height: 1.1;
}

.admin-brand p {
  color: var(--text-light);
}

.eyebrow {
  color: var(--primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.admin-nav {
  display: grid;
  gap: 0.65rem;
  margin-top: 2rem;
}

.admin-nav a,
.secondary-link,
.logout-btn {
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  padding: 0.9rem 1rem;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  transition: var(--transition);
}

.admin-nav a {
  background: #fff;
  color: var(--text);
}

.admin-nav a.router-link-active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.admin-actions {
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;
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

.admin-content {
  padding: 2rem;
}

@media (max-width: 960px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    position: relative;
    min-height: auto;
  }
}
</style>
