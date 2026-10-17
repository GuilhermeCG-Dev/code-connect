import { Divider } from '../../atoms/Divider'
import { SocialButton } from '../../molecules/SocialButton'

export type SocialProvider = {
  id: string
  label: string
  iconSrc: string
}

type SocialLoginProps = {
  providers?: SocialProvider[]
  onSelect?: (providerId: string) => void
}

const defaultProviders: SocialProvider[] = [
  { id: 'github', label: 'Github', iconSrc: '/Github.png' },
  { id: 'google', label: 'Gmail', iconSrc: '/Google.png' },
]

export function SocialLogin({
  providers = defaultProviders,
  onSelect,
}: SocialLoginProps) {
  return (
    <section className="flex flex-col items-center gap-2">
      <Divider>ou entre com outras contas</Divider>
      <div className="flex gap-6">
        {providers.map((provider) => (
          <SocialButton
            key={provider.id}
            label={provider.label}
            iconSrc={provider.iconSrc}
            onClick={() => onSelect?.(provider.id)}
          />
        ))}
      </div>
    </section>
  )
}
