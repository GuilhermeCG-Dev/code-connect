import type { ComponentProps, ReactNode } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'outline'
  icon?: ReactNode
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-accent text-ink hover:brightness-110',
  outline: 'border border-accent text-accent hover:bg-accent hover:text-ink',
}

export function Button({
  variant = 'primary',
  icon,
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  )
}
