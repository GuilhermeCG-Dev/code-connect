import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CommentItem } from './CommentItem'

describe('CommentItem', () => {
  it('renders author, body and date', () => {
    render(<CommentItem authorName="Ana Souza" body="Ótimo post!" createdAt="2026-10-19T12:00:00.000Z" />)
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('Ótimo post!')).toBeInTheDocument()
    expect(screen.getByText(/19\/10\/2026/)).toHaveAttribute('datetime', '2026-10-19T12:00:00.000Z')
  })
})
