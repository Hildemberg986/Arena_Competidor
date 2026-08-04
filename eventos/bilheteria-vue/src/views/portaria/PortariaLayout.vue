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
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

function handleLogout() {
  auth.logoutTotal(); // Limpa tudo e vai pro bem-vindo
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
  padding: 0.6rem 0.85rem;
  padding-top: max(0.6rem, env(safe-area-inset-top));
  background: #059669;
  color: white;
}
.portaria-brand h1 {
  font-size: 1rem;
  margin: 0;
}
.portaria-brand p {
  font-size: 0.65rem;
  opacity: 0.8;
  margin: 0;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font: inherit;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  white-space: nowrap;
}
.logout-btn:active {
  background: rgba(255, 255, 255, 0.25);
}

.portaria-content {
  flex: 1;
  padding: 0.6rem;
  width: 100%;
  box-sizing: border-box;
}

/* Tablet+ */
@media (min-width: 769px) {
  .portaria-header {
    padding: 0.75rem 1.5rem;
    padding-top: max(0.75rem, env(safe-area-inset-top));
  }
  .portaria-brand h1 {
    font-size: 1.2rem;
  }
  .logout-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  .portaria-content {
    padding: 1rem;
  }
}

/* Mobile pequeno */
@media (max-width: 480px) {
  .portaria-header {
    padding: 0.5rem 0.75rem;
  }
  .portaria-brand h1 {
    font-size: 0.95rem;
  }
  .portaria-content {
    padding: 0.4rem;
  }
}
</style>
