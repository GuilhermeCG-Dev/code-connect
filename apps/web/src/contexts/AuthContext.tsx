import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { SESSION_EXPIRED_EVENT } from '../services/api'
import { getProfile } from '../services/auth'
import type { User } from '../services/auth'
import { clearToken, getToken, saveToken } from '../services/token'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

type AuthContextValue = {
  user: User | null
  status: AuthStatus
  signIn: (token: string, remember: boolean) => Promise<User>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'anonymous'))

  const signOut = useCallback(() => {
    clearToken()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const signIn = useCallback(async (token: string, remember: boolean) => {
    saveToken(token, remember)
    const profile = await getProfile()
    setUser(profile)
    setStatus('authenticated')
    return profile
  }, [])

  // Restore the session from a stored token
  useEffect(() => {
    if (!getToken()) {
      return
    }
    let active = true
    getProfile()
      .then((profile) => {
        if (active) {
          setUser(profile)
          setStatus('authenticated')
        }
      })
      .catch(() => {
        if (active) {
          signOut()
        }
      })
    return () => {
      active = false
    }
  }, [signOut])

  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, signOut)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, signOut)
  }, [signOut])

  const value = useMemo(() => ({ user, status, signIn, signOut }), [user, status, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
