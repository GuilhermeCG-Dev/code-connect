import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../contexts/AuthContext'
import { getErrorStatus } from '../../../services/api'
import { login, signup } from '../../../services/auth'
import { AuthFooterLink } from '../../molecules/AuthFooterLink'
import { SignupForm } from '../../organisms/SignupForm'
import type { SignupValues } from '../../organisms/SignupForm'
import { SocialLogin } from '../../organisms/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate'

const errorMessages: Record<number, string> = {
  400: 'Verifique os dados. A senha precisa ter pelo menos 8 caracteres.',
  409: 'Este email já está cadastrado.',
}
const fallbackError = 'Não foi possível conectar ao servidor. Tente novamente.'

export function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSignup({ name, email, password, remember }: SignupValues) {
    setIsSubmitting(true)
    setError(undefined)
    try {
      await signup({ name, email, password })
      // Sign in right away so the user does not type the credentials twice
      const { accessToken } = await login({ email, password })
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
      bannerSrc="/banner-cadastro-desktop.png"
      bannerAlt="Mulher programando em um notebook diante de telas holográficas, com a logo CodeConnect"
      bannerHeightClass="h-168"
      footer={
        <AuthFooterLink
          question="Já tem conta?"
          linkText="Faça seu login!"
          href="/login"
          icon="login"
          layout="inline"
        />
      }
    >
      <SignupForm onSubmit={handleSignup} isSubmitting={isSubmitting} error={error} />
      <SocialLogin />
    </AuthTemplate>
  )
}
