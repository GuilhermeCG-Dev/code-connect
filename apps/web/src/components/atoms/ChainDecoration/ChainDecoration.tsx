type ChainDecorationProps = {
  className?: string
}

export function ChainDecoration({ className = '' }: ChainDecorationProps) {
  return (
    <svg
      data-testid="chain-decoration"
      viewBox="0 0 240 360"
      fill="none"
      stroke="currentColor"
      strokeWidth="44"
      aria-hidden="true"
      className={`text-decoration ${className}`}
    >
      <rect x="22" y="22" width="130" height="190" rx="65" />
      <rect x="88" y="148" width="130" height="190" rx="65" />
    </svg>
  )
}
