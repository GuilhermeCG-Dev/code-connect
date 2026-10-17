import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Button } from '../../atoms/Button'
import { Checkbox } from '../../atoms/Checkbox'
import { Heading } from '../../atoms/Heading'
import { Icon } from '../../atoms/Icon'
import { TextLink } from '../../atoms/TextLink'
import { FormField } from '../../molecules/FormField'

export type LoginValues = {
  identifier: string
  password: string
  remember: boolean
}

type LoginFormProps = {
  onSubmit: (values: LoginValues) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ identifier, password, remember })
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
            label="Email ou usuário"
            type="text"
            placeholder="usuario123"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <FormField
              label="Senha"
              type="password"
              placeholder="******"
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
      <Button type="submit" fullWidth icon={<Icon name="arrow-forward" className="size-5" />}>
        Login
      </Button>
    </form>
  )
}
