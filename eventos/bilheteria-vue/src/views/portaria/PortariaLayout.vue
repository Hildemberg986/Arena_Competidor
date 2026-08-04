<template>
  <div class="portaria-shell">
    <header class="portaria-header">
      <div class="portaria-brand">
        <h1>Portaria</h1>
        <p>Arena Competidor</p>
      </div>
      <button class="logout-btn" @click="handleLogout">Sair</button>
    </header>

    <main class="portaria-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_type");
  localStorage.removeItem("user");
  localStorage.removeItem("adminToken");
  router.push("/bem-vindo");
}
</script>

<style scoped>
.portaria-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}
.portaria-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  padding-top: max(0.75rem, env(safe-area-inset-top));
  background: #059669;
  color: white;
}
.portaria-brand h1 { font-size: 1.1rem; margin: 0; }
.portaria-brand p { font-size: 0.7rem; opacity: 0.8; margin: 0; }
.logout-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.logout-btn:active { background: rgba(255,255,255,0.25); }
.portaria-content { flex: 1; padding: 0.75rem; }
</style>