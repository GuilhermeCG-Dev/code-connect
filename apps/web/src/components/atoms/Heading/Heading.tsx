import type { ComponentProps } from 'react'

type HeadingProps = ComponentProps<'h1'> & {
  as?: 'h1' | 'h2'
}

export function Heading({ as: Tag = 'h1', className = '', ...props }: HeadingProps) {
  return <Tag className={`text-title font-semibold text-offwhite ${className}`} {...props} />
}
