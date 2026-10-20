import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('moves to the next and previous page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />)

    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    await userEvent.click(screen.getByRole('button', { name: 'Anterior' }))

    expect(onPageChange.mock.calls).toEqual([[3], [1]])
  })

  it('disables the previous button on the first page', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
  })

  it('renders nothing for a single page', () => {
    render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
