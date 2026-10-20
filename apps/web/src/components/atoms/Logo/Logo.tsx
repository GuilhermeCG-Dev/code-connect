type LogoProps = {
  className?: string
}

export function Logo({ className = 'h-10 w-auto' }: LogoProps) {
  return <img src="/logo.svg" alt="CodeConnect" className={className} />
}
