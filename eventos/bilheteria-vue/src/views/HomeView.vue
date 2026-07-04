<template>
  <div class="home-view">
    <section class="header-text">
      <h1>🎫 Bilheteria Digital</h1>
      <p>Garanta seu ingresso para os melhores eventos</p>
    </section>

    <EventFilters
      :current-filter="eventsStore.currentFilter"
      @update:filter="eventsStore.setFilter"
    />

    <div v-if="eventsStore.loading" class="loading">
      <i class="fa-solid fa-spinner"></i>
      <p>Carregando eventos...</p>
    </div>

    <div v-else-if="eventsStore.error" class="empty-state">
      <i class="fa-solid fa-circle-exclamation"></i>
      <h3>Erro ao carregar eventos</h3>
      <p>{{ eventsStore.error }}</p>
      <button @click="eventsStore.fetchEvents()" class="retry-btn">
        <i class="fa-solid fa-rotate"></i> Tentar novamente
      </button>
    </div>

    <div v-else>
      <div v-if="eventsStore.filteredEvents.length === 0" class="empty-state">
        <i class="fa-solid fa-ticket"></i>
        <h3>Nenhum evento encontrado</h3>
        <p>{{ emptyMessage }}</p>
      </div>

      <div v-else class="events-grid">
        <EventCard
          v-for="event in eventsStore.filteredEvents"
          :key="event.id"
          :event="event"
        />
      </div>
    </div>

    <FeaturedSection
      v-if="eventsStore.featuredEvent && eventsStore.currentFilter === 'todos'"
      :event="eventsStore.featuredEvent"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useEventsStore } from "@/stores/events";
import EventCard from "@/components/EventCard.vue";
import EventFilters from "@/components/EventFilters.vue";
import FeaturedSection from "@/components/FeaturedSection.vue";

const eventsStore = useEventsStore();

const emptyMessage = computed(() => {
  const messages = {
    todos: "No momento não há eventos disponíveis.",
    ativo: "Não há eventos ativos no momento.",
    planejado: "Não há eventos planejados.",
    finalizado: "Nenhum evento finalizado.",
  };
  return messages[eventsStore.currentFilter] || "Nenhum evento encontrado.";
});
</script>

<style scoped>
/* ============================================ */
/* GERAL */
/* ============================================ */
.home-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem;
  box-sizing: border-box;
}

.header-text {
  margin-bottom: 1.5rem;
  text-align: center;
}
.header-text h1 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--primary), #c81e14);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.header-text p {
  color: var(--text-light);
  margin-top: 4px;
  font-size: 0.9rem;
}

/* ============================================ */
/* LOADING / EMPTY */
/* ============================================ */
.loading,
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}
.loading i {
  font-size: 2rem;
  color: var(--primary);
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.empty-state i {
  font-size: 2.5rem;
  color: var(--text-light);
  opacity: 0.3;
  margin-bottom: 0.75rem;
}
.empty-state h3 {
  margin-bottom: 0.35rem;
  color: var(--text);
  font-size: 1.1rem;
}
.empty-state p {
  color: var(--text-light);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}
.retry-btn {
  padding: 0.5rem 1.25rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 0.85rem;
  -webkit-tap-highlight-color: transparent;
}
.retry-btn:active {
  background: #c81e14;
}

/* ============================================ */
/* EVENTS GRID */
/* ============================================ */
.events-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 0.75rem;
}

/* ============================================ */
/* TABLET */
/* ============================================ */
@media (min-width: 481px) and (max-width: 1023px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

/* ============================================ */
/* DESKTOP */
/* ============================================ */
@media (min-width: 1024px) {
  .home-view {
    padding: 1.5rem;
  }
  .header-text {
    margin-bottom: 2.5rem;
  }
  .header-text h1 {
    font-size: 2.2rem;
  }
  .header-text p {
    font-size: 1.1rem;
  }
  .events-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 1rem;
  }
  .loading i {
    font-size: 2.5rem;
  }
  .empty-state i {
    font-size: 3rem;
  }
  .loading,
  .empty-state {
    padding: 3rem 1rem;
  }
}
</style>
