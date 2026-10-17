import type { ComponentProps } from 'react'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded bg-field px-4 py-2 text-small text-page placeholder:text-surface focus:outline-2 focus:outline-accent ${className}`}
      {...props}
    />
  )
}
