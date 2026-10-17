import { AuthFooterLink } from '../../molecules/AuthFooterLink'
import { SignupForm } from '../../organisms/SignupForm'
import type { SignupValues } from '../../organisms/SignupForm'
import { SocialLogin } from '../../organisms/SocialLogin'
import { AuthTemplate } from '../../templates/AuthTemplate'

export function SignupPage() {
  function handleSignup(values: SignupValues) {
    // TODO: call the API once the users endpoint exists
    console.info('signup submitted', { email: values.email })
  }

  return (
    <AuthTemplate
      bannerSrc="/banner-cadastro-desktop.png"
      bannerAlt="Mulher programando em um notebook diante de telas holográficas, com a logo CodeConnect"
      bannerHeightClass="h-168.75"
      footer={
        <AuthFooterLink
          question="Já tem conta?"
          linkText="Faça seu login!"
          href="/"
          icon="login"
          layout="inline"
        />
      }
    >
      <SignupForm onSubmit={handleSignup} />
      <SocialLogin />
    </AuthTemplate>
  )
}
