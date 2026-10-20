import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CommentForm } from './CommentForm'

describe('CommentForm', () => {
  it('submits the trimmed comment and clears the field', async () => {
    const onSubmit = vi.fn()
    render(<CommentForm onSubmit={onSubmit} />)

    const field = screen.getByLabelText('Seu comentário')
    await userEvent.type(field, '  Ótimo post!  ')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(onSubmit).toHaveBeenCalledWith('Ótimo post!')
    expect(field).toHaveValue('')
  })

  it('keeps the text and shows the error when sending fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('fail'))
    const { rerender } = render(<CommentForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Seu comentário'), 'Oi')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))
    rerender(<CommentForm onSubmit={onSubmit} error="Não foi possível comentar." />)

    expect(screen.getByLabelText('Seu comentário')).toHaveValue('Oi')
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível comentar.')
  })
})
