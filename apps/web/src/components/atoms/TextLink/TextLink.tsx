import type { ComponentProps } from 'react'

type TextLinkProps = ComponentProps<'a'> & {
  variant?: 'underline' | 'accent'
}

const variants = {
  underline: 'text-small text-offwhite underline',
  accent: 'text-paragraph text-accent hover:underline',
}

export function TextLink({
  variant = 'underline',
  className = '',
  ...props
}: TextLinkProps) {
  return <a className={`${variants[variant]} ${className}`} {...props} />
}
