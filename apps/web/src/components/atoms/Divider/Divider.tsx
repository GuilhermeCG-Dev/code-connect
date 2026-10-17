type DividerProps = {
  children: string
}

export function Divider({ children }: DividerProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-offwhite">
      <span aria-hidden="true" className="h-px flex-1 bg-muted/60" />
      <span>{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-muted/60" />
    </div>
  )
}
