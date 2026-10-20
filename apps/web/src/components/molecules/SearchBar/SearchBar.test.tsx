import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('searches the trimmed text on Enter', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar posts' }), '  react hooks {Enter}')

    expect(onSearch).toHaveBeenCalledWith('react hooks')
  })

  it('searches with the button and shows the initial value', async () => {
    const onSearch = vi.fn()
    render(<SearchBar defaultValue="css" onSearch={onSearch} />)

    expect(screen.getByRole('searchbox')).toHaveValue('css')
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(onSearch).toHaveBeenCalledWith('css')
  })

  it('follows a new default value', () => {
    const { rerender } = render(<SearchBar defaultValue="css" onSearch={vi.fn()} />)
    rerender(<SearchBar defaultValue="" onSearch={vi.fn()} />)
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })
})
