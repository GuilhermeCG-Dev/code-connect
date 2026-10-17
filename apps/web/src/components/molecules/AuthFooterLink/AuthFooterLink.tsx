import { Icon } from '../../atoms/Icon'
import type { IconName } from '../../atoms/Icon'
import { TextLink } from '../../atoms/TextLink'

type AuthFooterLinkProps = {
  question: string
  linkText: string
  href: string
  icon?: IconName
  layout?: 'stacked' | 'inline'
}

const layouts = {
  stacked: 'flex-col text-small',
  inline: 'flex-row text-paragraph',
}

const iconSizes: Record<IconName, string> = {
  'arrow-forward': 'size-6',
  assignment: 'h-5.25 w-4.5',
  login: 'size-6',
}

export function AuthFooterLink({
  question,
  linkText,
  href,
  icon = 'assignment',
  layout = 'stacked',
}: AuthFooterLinkProps) {
  return (
    <div className={`flex items-center gap-2 text-offwhite ${layouts[layout]}`}>
      <p>{question}</p>
      <TextLink variant="accent" href={href} className="flex items-center gap-3">
        {linkText}
        <Icon name={icon} className={iconSizes[icon]} />
      </TextLink>
    </div>
  )
}
