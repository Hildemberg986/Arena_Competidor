<template>
  <div id="app">
    <header class="app-header">
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
      </div>
    </header>

    <main class="container">
      <router-view />
    </main>

    <footer class="app-footer">
      Arena Competidor &copy; 2026 &bull; Todos os direitos reservados &bull;
      Bilheteria Digital
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useEventsStore } from "@/stores/events";

const eventsStore = useEventsStore();

onMounted(() => {
  eventsStore.fetchEvents();
});
</script>

<style>
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
}
</style>
