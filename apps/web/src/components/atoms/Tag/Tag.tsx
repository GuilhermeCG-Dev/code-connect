type TagProps = {
  children: string
}

export function Tag({ children }: TagProps) {
  return <li className="rounded bg-accent px-2 py-1 text-sm text-ink">{children}</li>
}
