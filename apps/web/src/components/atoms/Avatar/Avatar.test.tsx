import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('uses the default avatar without a source', () => {
    render(<Avatar alt="Ana" />)
    expect(screen.getByRole('img', { name: 'Ana' })).toHaveAttribute('src', '/avatar-default.png')
  })

  it('falls back to the default avatar when the image fails', () => {
    render(<Avatar src="/broken.png" alt="Ana" />)
    const img = screen.getByRole('img', { name: 'Ana' })
    fireEvent.error(img)
    expect(img).toHaveAttribute('src', '/avatar-default.png')
  })
})
