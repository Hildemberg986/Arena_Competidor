import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventsService } from '@/services/api'

export const useEventsStore = defineStore('events', () => {
  const events = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentFilter = ref('todos')

  const filteredEvents = computed(() => {
    if (currentFilter.value === 'todos') {
      // Mostra apenas ativos e planejados (disponíveis para compra)
      return events.value.filter(event => 
        event.status === 'ativo' || event.status === 'planejado'
      )
    }
    
    // Filtro específico, mas nunca mostra cancelados
    return events.value.filter(event => 
      event.status === currentFilter.value && event.status !== 'cancelado'
    )
  })

  const featuredEvent = computed(() => {
    return events.value.find(event => event.status === 'ativo') || null
  })

  const activeEventsCount = computed(() => {
    return events.value.filter(e => e.status === 'ativo').length
  })

  const plannedEventsCount = computed(() => {
    return events.value.filter(e => e.status === 'planejado').length
  })

  const finishedEventsCount = computed(() => {
    return events.value.filter(e => e.status === 'finalizado').length
  })

  async function fetchEvents() {
    loading.value = true
    error.value = null
    try {
      const data = await eventsService.getEvents()
      if (data.status === 'success' && data.data) {
        // Remove cancelados já na origem
        events.value = data.data.filter(event => event.status !== 'cancelado')
      } else if (Array.isArray(data)) {
        events.value = data.filter(event => event.status !== 'cancelado')
      } else if (data.data && Array.isArray(data.data)) {
        events.value = data.data.filter(event => event.status !== 'cancelado')
      } else {
        throw new Error('Dados inválidos recebidos da API')
      }
    } catch (err) {
      error.value = err.message || 'Erro ao carregar eventos'
      console.error('Erro ao carregar eventos:', err)
    } finally {
      loading.value = false
    }
  }

  function setFilter(filter) {
    currentFilter.value = filter
  }

  return {
    events,
    loading,
    error,
    currentFilter,
    filteredEvents,
    featuredEvent,
    activeEventsCount,
    plannedEventsCount,
    finishedEventsCount,
    fetchEvents,
    setFilter
  }
})