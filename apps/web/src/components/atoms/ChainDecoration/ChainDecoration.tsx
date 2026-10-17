type ChainDecorationProps = {
  className?: string
}

export function ChainDecoration({ className = '' }: ChainDecorationProps) {
  return (
    <img
      data-testid="chain-decoration"
      src="/simbolo.svg"
      alt=""
      aria-hidden="true"
      width={407}
      height={486}
      className={className}
    />
  )
}
