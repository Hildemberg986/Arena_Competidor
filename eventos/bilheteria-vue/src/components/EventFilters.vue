<template>
  <div class="filters">
    <button 
      v-for="filter in filters" 
      :key="filter.value"
      :class="['filter-btn', { active: currentFilter === filter.value }]"
      @click="$emit('update:filter', filter.value)"
    >
      <i :class="`fa-solid ${filter.icon}`"></i> {{ filter.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentFilter: {
    type: String,
    required: true
  }
})

defineEmits(['update:filter'])

const filters = [
  { value: 'todos', label: 'Todos', icon: 'fa-list' },
  { value: 'planejado', label: 'Planejados', icon: 'fa-calendar-plus' },
  { value: 'ativo', label: 'Ativos', icon: 'fa-circle' },
  { value: 'concluido', label: 'Concluídos', icon: 'fa-check-circle' },
  { value: 'cancelado', label: 'Cancelados', icon: 'fa-ban' }
]
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-btn {
  padding: 0.6rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  background: var(--card);
  color: var(--text-light);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn i {
  font-size: 0.8rem;
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
</style>