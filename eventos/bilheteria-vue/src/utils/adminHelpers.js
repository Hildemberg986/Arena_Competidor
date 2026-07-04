export function formatDateBR(dateString) {
  if (!dateString) {
    return '-'
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatCurrencyBR(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0))
}

export function getApiErrorMessage(error, fallback = 'Não foi possível concluir a operação.') {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  )
}

export function unwrapCollection(response) {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (response?.status === 'success' && Array.isArray(response?.data)) {
    return response.data
  }

  return []
}

export function unwrapItem(response) {
  if (!response) {
    return null
  }

  if (response?.status === 'success' && response?.data && !Array.isArray(response.data)) {
    return response.data
  }

  if (response?.data && !Array.isArray(response.data)) {
    return response.data
  }

  if (!Array.isArray(response)) {
    return response
  }

  return null
}