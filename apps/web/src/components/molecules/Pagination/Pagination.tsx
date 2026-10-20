type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const buttonClass =
  'cursor-pointer rounded-lg border border-accent px-4 py-2 text-base text-accent transition hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-accent'

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-4 text-offwhite">
      <button type="button" className={buttonClass} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {totalPages}
      </span>
      <button
        type="button"
        className={buttonClass}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </button>
    </nav>
  )
}
