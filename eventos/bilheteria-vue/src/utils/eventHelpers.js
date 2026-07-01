/**
 * Formata uma data para o padrão brasileiro
 * @param {string} dateString - Data em formato ISO
 * @returns {string} Data formatada
 */
export function formatDate(dateString) {
  if (!dateString) return 'Data não definida'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return 'Data inválida'
  }
}

/**
 * Retorna um ícone baseado no ID do evento
 * @param {number} id - ID do evento
 * @returns {string} Classe do ícone FontAwesome
 */
export function getEventIcon(id) {
  const icons = [
    'fa-trophy',
    'fa-medal',
    'fa-crown',
    'fa-star',
    'fa-fire',
    'fa-futbol',
    'fa-basketball',
    'fa-music'
  ]
  return icons[id % icons.length]
}

/**
 * Gera um background gradiente aleatório
 * @returns {string} CSS do gradiente
 */
export function getBannerBackground() {
  const color1 = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  const color2 = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  return `linear-gradient(135deg, #${color1} 0%, #${color2} 100%)`
}

/**
 * Retorna a cor do status
 * @param {string} status - Status do evento
 * @returns {string} Classe CSS do status
 */
export function getStatusColor(status) {
  const colors = {
    ativo: 'status-ativo',
    planejado: 'status-planejado',
    concluido: 'status-concluido',
    cancelado: 'status-cancelado'
  }
  return colors[status] || 'status-planejado'
}