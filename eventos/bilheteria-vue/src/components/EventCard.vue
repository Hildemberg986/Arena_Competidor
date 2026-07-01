<template>
  <div class="event-card" @click="goToDetails">
    <div class="event-banner" :style="bannerStyle">
      <img v-if="event.banner_url" :src="event.banner_url" :alt="`Banner do evento ${event.nome_campeonato}`" loading="lazy">
      <i v-else :class="`fa-solid ${eventIcon} banner-icon`"></i>
      
      <div :class="`event-badge badge-${event.status}`">
        <i :class="`fa-solid ${statusIcon}`"></i> {{ statusLabel }}
      </div>
    </div>
    
    <div class="event-content">
      <h3>{{ event.nome_campeonato || 'Evento sem nome' }}</h3>
      
      <div class="event-location">
        <i class="fa-solid fa-location-dot"></i>
        {{ eventLocation }}
      </div>
      
      <div class="event-info">
        <span>
          <i class="fa-regular fa-calendar"></i> 
          {{ formatDate(event.data_inicio) }} - {{ formatDate(event.data_fim) }}
        </span>
        <span v-if="event.organizador">
          <i class="fa-solid fa-user"></i> {{ event.organizador }}
        </span>
      </div>
      
      <button class="btn-comprar" @click.stop="goToDetails">
        <i :class="buttonIcon"></i> {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const icons = [
  'fa-trophy', 'fa-medal', 'fa-crown', 'fa-star',
  'fa-fire', 'fa-futbol', 'fa-basketball', 'fa-music'
]

const eventIcon = computed(() => {
  return icons[props.event.id % icons.length]
})

const bannerStyle = computed(() => {
  if (props.event.banner_url) return ''
  const color1 = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  const color2 = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  return `background: linear-gradient(135deg, #${color1} 0%, #${color2} 100%);`
})

const eventLocation = computed(() => {
  const parts = [props.event.local, props.event.cidade, props.event.estado].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : 'Local não definido'
})

const statusConfig = computed(() => {
  const configs = {
    ativo: { icon: 'fa-circle', label: 'Ativo' },
    planejado: { icon: 'fa-calendar-plus', label: 'Planejado' },
    concluido: { icon: 'fa-check-circle', label: 'Concluído' },
    cancelado: { icon: 'fa-ban', label: 'Cancelado' }
  }
  return configs[props.event.status] || configs.planejado
})

const statusIcon = computed(() => statusConfig.value.icon)
const statusLabel = computed(() => statusConfig.value.label)

const buttonConfig = computed(() => {
  const configs = {
    ativo: { icon: 'fa-solid fa-cart-shopping', text: 'Comprar Ingresso' },
    planejado: { icon: 'fa-solid fa-clock', text: 'Ver Detalhes' },
    concluido: { icon: 'fa-solid fa-info-circle', text: 'Ver Detalhes' },
    cancelado: { icon: 'fa-solid fa-info-circle', text: 'Ver Detalhes' }
  }
  return configs[props.event.status] || configs.planejado
})

const buttonIcon = computed(() => buttonConfig.value.icon)
const buttonText = computed(() => buttonConfig.value.text)

function formatDate(dateString) {
  if (!dateString) return 'Data não definida'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function goToDetails() {
  router.push({ name: 'campeonato', params: { id: props.event.id } })
}
</script>

<style scoped>
.event-card {
  background: var(--card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.15);
}

.event-banner {
  width: 100%;
  position: relative;
  padding-bottom: 125%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.event-banner img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background-color: #f1f5f9;
}

.banner-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  color: white;
  opacity: 0.8;
}

.event-badge {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;
  backdrop-filter: blur(10px);
}

.badge-planejado {
  background: rgba(59, 130, 246, 0.95);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-ativo {
  background: rgba(16, 185, 129, 0.95);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: pulse 2s infinite;
}

.badge-concluido {
  background: rgba(100, 116, 139, 0.95);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-cancelado {
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.event-content {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.event-content h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-light);
  font-size: 0.8rem;
  margin-bottom: 0.8rem;
}

.event-location i {
  color: var(--primary);
  font-size: 0.9rem;
}

.event-info {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.event-info span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--text-light);
  background: var(--bg);
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.event-info i {
  font-size: 0.8rem;
  color: var(--primary);
}

.btn-comprar {
  width: 100%;
  padding: 0.8rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  font-family: inherit;
}

.btn-comprar:hover {
  background: #c81e14;
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(230, 33, 23, 0.3);
}

.btn-comprar:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .banner-icon {
    font-size: 3rem;
  }
  
  .event-badge {
    padding: 0.3rem 0.7rem;
    font-size: 0.65rem;
  }
}
</style>