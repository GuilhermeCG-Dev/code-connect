import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialLogin } from './SocialLogin'

describe('SocialLogin', () => {
  it('lists default providers and reports selection', async () => {
    const onSelect = vi.fn()
    render(<SocialLogin onSelect={onSelect} />)
    expect(screen.getByText('ou entre com outras contas')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Github' }))
    expect(onSelect).toHaveBeenCalledWith('github')
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
  })
})
