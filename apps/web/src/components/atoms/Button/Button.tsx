import type { ComponentProps, ReactNode } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary'
  icon?: ReactNode
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-accent text-ink hover:brightness-110',
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
      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold transition ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  )
}
