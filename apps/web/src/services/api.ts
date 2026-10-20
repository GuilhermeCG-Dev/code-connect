import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { clearToken, getToken } from './token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

// Fired when the API rejects the stored token (expired or invalid)
export const SESSION_EXPIRED_EVENT = 'codeconnect:session-expired'

type RetriableConfig = InternalAxiosRequestConfig & { anonymousRetry?: boolean }

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token && !(config as RetriableConfig).anonymousRetry) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(undefined, (error: unknown) => {
  const config = axios.isAxiosError(error) ? (error.config as RetriableConfig | undefined) : undefined
  const sentToken = Boolean(config?.headers?.Authorization)
  if (config && sentToken && getErrorStatus(error) === 401) {
    clearToken()
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    // Public reads still work without a session, so try once more anonymously
    if (config.method === 'get' && !config.anonymousRetry) {
      config.anonymousRetry = true
      delete config.headers.Authorization
      return api.request(config)
    }
  }
  return Promise.reject(error)
})

// Undefined when the request never got a response (network error, API down)
export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
