import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SortTabs } from './SortTabs'

const options = [
  { value: 'recent', label: 'Recentes' },
  { value: 'popular', label: 'Populares' },
]

describe('SortTabs', () => {
  it('marks the current option and changes it', async () => {
    const onChange = vi.fn()
    render(<SortTabs options={options} value="recent" onChange={onChange} />)

    expect(screen.getByRole('button', { name: 'Recentes' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Populares' }))

    expect(onChange).toHaveBeenCalledWith('popular')
  })
})
