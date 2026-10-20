import type { ComponentProps } from 'react'

export function Textarea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={`w-full rounded bg-field px-4 py-2 text-base text-page placeholder:text-surface focus:outline-2 focus:outline-accent ${className}`}
      {...props}
    />
  )
}
