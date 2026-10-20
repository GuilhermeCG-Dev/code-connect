import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../contexts/AuthContext'
import { getErrorStatus } from '../../../services/api'
import { login } from '../../../services/auth'
import { AuthFooterLink } from '../../molecules/AuthFooterLink'
import { LoginForm } from '../../organisms/LoginForm'
import type { LoginValues } from '../../organisms/LoginForm'
import { SocialLogin } from '../../organisms/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate'

const errorMessages: Record<number, string> = {
  400: 'Verifique o email e a senha informados.',
  401: 'Email ou senha inválidos.',
}
const fallbackError = 'Não foi possível conectar ao servidor. Tente novamente.'

export function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleLogin({ email, password, remember }: LoginValues) {
    setIsSubmitting(true)
    setError(undefined)
    try {
      const { accessToken } = await login({ email, password })
      // Loading the profile proves the token works before leaving the page
      await signIn(accessToken, remember)
      navigate('/')
    } catch (err) {
      setError(errorMessages[getErrorStatus(err) ?? 0] ?? fallbackError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-login-desktop.png"
      bannerAlt="Mulher sorrindo programando em um notebook, com a logo CodeConnect"
      footer={
        <AuthFooterLink
          question="Ainda não tem conta?"
          linkText="Crie seu cadastro!"
          href="/cadastro"
        />
      }
    >
      <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} error={error} />
      <SocialLogin />
    </AuthTemplate>
  )
}
