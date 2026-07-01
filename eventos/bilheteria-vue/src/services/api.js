import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://0.0.0.0:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const eventsService = {
  async getEvents() {
    const response = await apiClient.get('/campeonatos/')
    return response.data
  },
  
  async getEventById(id) {
    const response = await apiClient.get(`/campeonatos/${id}`)
    return response.data
  },

  async getTiposInscricaoByCampeonatoId(id) {
    const response = await apiClient.get(`/tipos-inscricao/campeonato/${id}`)
    return response.data
  },

  async getPrecosByCampeonatoId(id) {
    const response = await apiClient.get(`/precos/campeonato/${id}`)
    return response.data
  }
}

export const authService = {
  async login(email, senha) {
    const response = await apiClient.post('/auth/login', { email, senha })
    return response.data
  }
}