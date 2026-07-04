<template>
  <div class="filters-container">
    <div class="filters-scroll">
      <button
        v-for="filter in filters"
        :key="filter.value"
        :class="['filter-btn', { active: currentFilter === filter.value }]"
        @click="$emit('update:filter', filter.value)"
      >
        <i :class="`fa-solid ${filter.icon}`"></i>
        {{ filter.label }}
        <span v-if="filter.count !== undefined" class="filter-count">
          {{ filter.count }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEventsStore } from '@/stores/events'

defineProps({
  currentFilter: {
    type: String,
    required: true
  }
})

defineEmits(['update:filter'])

const eventsStore = useEventsStore()

const filters = computed(() => [
  { 
    value: 'todos', 
    label: 'Disponíveis', 
    icon: 'fa-ticket',
    count: eventsStore.activeEventsCount + eventsStore.plannedEventsCount
  },
  { 
    value: 'ativo', 
    label: 'Ativos', 
    icon: 'fa-circle-play',
    count: eventsStore.activeEventsCount
  },
  { 
    value: 'planejado', 
    label: 'Em breve', 
    icon: 'fa-clock',
    count: eventsStore.plannedEventsCount
  },
  { 
    value: 'finalizado', 
    label: 'Finalizados', 
    icon: 'fa-circle-check',
    count: eventsStore.finishedEventsCount
  }
])
</script>

<style scoped>
.filters-container {
  margin-bottom: 2rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filters-container::-webkit-scrollbar {
  display: none;
}

.filters-scroll {
  display: flex;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  justify-content: center;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: var(--card);
  border: 2px solid #e2e8f0;
  border-radius: 999px;
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: inherit;
}

.filter-btn i {
  font-size: 0.85rem;
}

.filter-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: var(--primary);
  transform: translateY(-1px);
}

.filter-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.filter-count {
  background: rgba(0, 0, 0, 0.08);
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.25);
}

@media (max-width: 768px) {
  .filters-scroll {
    justify-content: flex-start;
  }
  
  .filter-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>