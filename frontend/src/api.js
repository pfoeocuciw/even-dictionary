const API_BASE = '/api/words'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Ошибка запроса: ${res.status}`)
  }
  return res.json()
}

export function searchWords(query, { limit = 60, offset = 0, signal } = {}) {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    offset: String(offset),
  })
  return request(`/search?${params}`, { signal })
}

export function getWord(id, { signal } = {}) {
  return request(`/${id}`, { signal })
}

export function getAlphabet({ signal } = {}) {
  return request('/alphabet', { signal })
}

export function getStats({ signal } = {}) {
  return fetch('/api/health', { signal }).then(async (res) => {
    if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`)
    return res.json()
  })
}
