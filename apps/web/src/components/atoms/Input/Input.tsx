import type { ComponentProps } from 'react'

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={`w-full rounded-md bg-field px-4 py-2.5 text-sm text-ink placeholder:text-ink/70 focus:outline-2 focus:outline-accent ${className}`}
      {...props}
    />
  )
}
