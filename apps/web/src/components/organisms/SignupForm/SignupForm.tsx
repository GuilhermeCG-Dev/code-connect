import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Button } from '../../atoms/Button'
import { Checkbox } from '../../atoms/Checkbox'
import { Heading } from '../../atoms/Heading'
import { Icon } from '../../atoms/Icon'
import { FormField } from '../../molecules/FormField'

export type SignupValues = {
  name: string
  email: string
  password: string
  remember: boolean
}

type SignupFormProps = {
  onSubmit: (values: SignupValues) => void
  isSubmitting?: boolean
  error?: string
}

export function SignupForm({ onSubmit, isSubmitting = false, error }: SignupFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ name, email, password, remember })
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-6">
        <Heading>Cadastro</Heading>
        <p className="text-xl text-offwhite">Olá! Preencha seus dados.</p>
      </div>
      <div className="flex flex-col gap-4">
        <FormField
          label="Nome"
          type="text"
          autoComplete="name"
          placeholder="Nome completo"
          required
          maxLength={100}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
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
            autoComplete="new-password"
            placeholder="******"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Checkbox
            label="Lembrar-me"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
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
        {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
      </Button>
    </form>
  )
}
