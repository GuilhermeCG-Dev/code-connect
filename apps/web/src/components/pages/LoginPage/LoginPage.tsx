import { AuthFooterLink } from '../../molecules/AuthFooterLink'
import { LoginForm } from '../../organisms/LoginForm'
import type { LoginValues } from '../../organisms/LoginForm'
import { SocialLogin } from '../../organisms/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate'

export function LoginPage() {
  function handleLogin(values: LoginValues) {
    // TODO: call the API once the auth endpoint exists
    console.info('login submitted', { identifier: values.identifier })
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
      <LoginForm onSubmit={handleLogin} />
      <SocialLogin />
    </AuthTemplate>
  )
}
