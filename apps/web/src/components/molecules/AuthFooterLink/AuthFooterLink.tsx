import { Icon } from '../../atoms/Icon'
import { TextLink } from '../../atoms/TextLink'

type AuthFooterLinkProps = {
  question: string
  linkText: string
  href: string
}

export function AuthFooterLink({ question, linkText, href }: AuthFooterLinkProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-sm text-offwhite">
      <p>{question}</p>
      <TextLink variant="accent" href={href} className="flex items-center gap-2">
        {linkText}
        <Icon name="assignment" className="h-5 w-4" />
      </TextLink>
    </div>
  )
}
