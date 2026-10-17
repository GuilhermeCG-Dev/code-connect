import type { ComponentProps } from 'react'

type SocialButtonProps = Omit<ComponentProps<'button'>, 'children'> & {
  label: string
  iconSrc: string
}

export function SocialButton({
  label,
  iconSrc,
  type = 'button',
  className = '',
  ...props
}: SocialButtonProps) {
  return (
    <button
      type={type}
      className={`flex cursor-pointer flex-col items-center gap-1 text-xs text-offwhite hover:opacity-80 ${className}`}
      {...props}
    >
      <img src={iconSrc} alt="" className="size-8" />
      <span>{label}</span>
    </button>
  )
}
