type DividerProps = {
  children: string
}

export function Divider({ children }: DividerProps) {
  return (
    <div className="flex w-full items-center gap-4 text-small text-offwhite">
      <span aria-hidden="true" className="h-px flex-1 bg-offwhite" />
      <span>{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-offwhite" />
    </div>
  )
}
