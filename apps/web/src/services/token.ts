const TOKEN_KEY = 'codeconnect:accessToken'

// Storage can throw (private mode, blocked site data), so every access is guarded
function read(storage: Storage): string | null {
  try {
    return storage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function remove(storage: Storage) {
  try {
    storage.removeItem(TOKEN_KEY)
  } catch {
    // nothing to clear
  }
}

export function saveToken(token: string, remember: boolean) {
  clearToken()
  try {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(TOKEN_KEY, token)
  } catch {
    // token lives only for this page load
  }
}

export function getToken(): string | null {
  return read(sessionStorage) ?? read(localStorage)
}

export function clearToken() {
  remove(sessionStorage)
  remove(localStorage)
}
