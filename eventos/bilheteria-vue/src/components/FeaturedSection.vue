<template>
  <div class="featured-section">
    <div class="featured-text">
      <h2>🔥 Evento em Destaque</h2>
      <p>{{ description }}</p>
    </div>
    <router-link 
      :to="{ name: 'campeonato', params: { id: event.id }}"
      class="featured-btn"
    >
      <i class="fa-solid fa-ticket"></i> Ver detalhes
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const description = computed(() => {
  if (props.event.status === 'ativo') {
    return `Ingressos disponíveis para ${props.event.nome_campeonato} em ${props.event.local || props.event.cidade}`
  }
  return `Confira ${props.event.nome_campeonato} - ${props.event.status === 'planejado' ? 'Em breve' : 'Saiba mais'}`
})
</script>

<style scoped>
.featured-section {
  margin-top: 3rem;
  background: linear-gradient(135deg, var(--primary), #c81e14);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.featured-text h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.featured-text p {
  opacity: 0.95;
  font-size: 0.95rem;
}

.featured-btn {
  background: white;
  color: var(--primary);
  border: none;
  padding: 0.7rem 2rem;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.featured-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .featured-section {
    padding: 1.2rem;
    text-align: center;
    justify-content: center;
  }
}
</style>