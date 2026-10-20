import { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, SESSION_EXPIRED_EVENT } from './api'
import { getProfile, login } from './auth'
import { clearToken, getToken, saveToken } from './token'

// Replace the HTTP adapter so requests never leave the test
function stubAdapter(data: unknown) {
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }))
  api.defaults.adapter = adapter
  return adapter
}

describe('token storage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('keeps the token in localStorage when remember is on', () => {
    saveToken('abc', true)
    expect(localStorage.length).toBe(1)
    expect(sessionStorage.length).toBe(0)
    expect(getToken()).toBe('abc')
  })

  it('keeps the token in sessionStorage when remember is off', () => {
    saveToken('abc', false)
    expect(sessionStorage.length).toBe(1)
    expect(localStorage.length).toBe(0)
    expect(getToken()).toBe('abc')
  })

  it('clears the token from both storages', () => {
    saveToken('abc', true)
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('auth service', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('posts credentials to /auth/login', async () => {
    const adapter = stubAdapter({ accessToken: 'abc' })

    await expect(login({ email: 'ana@codeconnect.dev', password: 'supersecret' })).resolves.toEqual({
      accessToken: 'abc',
    })

    const config = adapter.mock.calls[0][0]
    expect(config.method).toBe('post')
    expect(config.url).toBe('/auth/login')
    expect(JSON.parse(config.data)).toEqual({ email: 'ana@codeconnect.dev', password: 'supersecret' })
  })

  it('sends the stored token as a Bearer header', async () => {
    const adapter = stubAdapter({ id: '1' })
    saveToken('abc', false)

    await getProfile()

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer abc')
  })
})

describe('expired session', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('drops the token and retries public reads anonymously', async () => {
    saveToken('expired', true)
    const onExpired = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => {
      if (config.headers.Authorization) {
        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
          data: {},
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
        })
      }
      return { data: { items: [] }, status: 200, statusText: 'OK', headers: {}, config }
    })
    api.defaults.adapter = adapter

    await expect(api.get('/posts')).resolves.toMatchObject({ data: { items: [] } })

    expect(adapter).toHaveBeenCalledTimes(2)
    expect(getToken()).toBeNull()
    expect(onExpired).toHaveBeenCalledTimes(1)
    window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  })
})
