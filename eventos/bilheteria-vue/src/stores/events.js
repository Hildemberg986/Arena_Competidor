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
      return events.value
    }
    return events.value.filter(event => event.status === currentFilter.value)
  })

  const featuredEvent = computed(() => {
    const activeEvents = events.value.filter(e => e.status === 'ativo')
    if (activeEvents.length > 0) {
      return activeEvents[0]
    }
    return events.value[0] || null
  })

  async function fetchEvents() {
    loading.value = true
    error.value = null
    try {
      const data = await eventsService.getEvents()
      if (data.status === 'success' && data.data) {
        events.value = data.data
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
    fetchEvents,
    setFilter
  }
})