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

    <!-- Loading State -->
    <div v-if="eventsStore.loading" class="loading">
      <i class="fa-solid fa-spinner"></i>
      <p>Carregando eventos...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="eventsStore.error" class="empty-state">
      <i class="fa-solid fa-circle-exclamation"></i>
      <h3>Erro ao carregar eventos</h3>
      <p>{{ eventsStore.error }}</p>
      <button @click="eventsStore.fetchEvents()" class="retry-btn">
        <i class="fa-solid fa-rotate"></i> Tentar novamente
      </button>
    </div>

    <!-- Events Grid -->
    <div v-else>
      <div v-if="eventsStore.filteredEvents.length === 0" class="empty-state">
        <i class="fa-solid fa-ticket"></i>
        <h3>Nenhum evento disponível</h3>
        <p>No momento não há eventos cadastrados. Volte em breve!</p>
      </div>

      <div v-else class="events-grid">
        <EventCard 
          v-for="event in eventsStore.filteredEvents" 
          :key="event.id"
          :event="event"
        />
      </div>
    </div>

    <!-- Seção Destaque -->
    <FeaturedSection 
      v-if="eventsStore.featuredEvent"
      :event="eventsStore.featuredEvent"
    />
  </div>
</template>

<script setup>
import { useEventsStore } from '@/stores/events'
import EventCard from '@/components/EventCard.vue'
import EventFilters from '@/components/EventFilters.vue'
import FeaturedSection from '@/components/FeaturedSection.vue'

const eventsStore = useEventsStore()
</script>

<style scoped>
.header-text {
  margin-bottom: 2.5rem;
  text-align: center;
}

.header-text h1 {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--primary), #c81e14);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  color: var(--text-light);
  margin-top: 8px;
  font-size: 1.1rem;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading i {
  font-size: 2.5rem;
  color: var(--primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-light);
  opacity: 0.3;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text);
}

.empty-state p {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.6rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: var(--transition);
}

.retry-btn:hover {
  background: #c81e14;
  transform: translateY(-2px);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 1rem;
}

@media (min-width: 1024px) {
  .events-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .header-text h1 {
    font-size: 1.6rem;
  }
  
  .events-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>