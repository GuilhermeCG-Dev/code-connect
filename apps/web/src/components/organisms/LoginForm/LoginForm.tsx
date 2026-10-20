import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Button } from '../../atoms/Button'
import { Checkbox } from '../../atoms/Checkbox'
import { Heading } from '../../atoms/Heading'
import { Icon } from '../../atoms/Icon'
import { TextLink } from '../../atoms/TextLink'
import { FormField } from '../../molecules/FormField'

export type LoginValues = {
  email: string
  password: string
  remember: boolean
}

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
  isSubmitting?: boolean
  error?: string
}

export function LoginForm({ onSubmit, isSubmitting = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ email, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-80 flex-col gap-8">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Heading>Login</Heading>
          <p className="text-xl text-offwhite">Boas-vindas! Faça seu login.</p>
        </div>
        <div className="flex flex-col gap-4">
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Digite seu email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <FormField
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="******"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="flex items-center justify-between">
              <Checkbox
                label="Lembrar-me"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <TextLink href="/esqueci-a-senha">Esqueci a senha</TextLink>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
      )}
      <Button
        type="submit"
        fullWidth
        disabled={isSubmitting}
        icon={<Icon name="arrow-forward" className="size-5" />}
      >
        {isSubmitting ? 'Entrando...' : 'Login'}
      </Button>
    </form>
  )
}
