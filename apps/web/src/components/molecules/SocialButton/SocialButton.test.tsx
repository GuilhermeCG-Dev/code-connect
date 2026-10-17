import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialButton } from './SocialButton'

describe('SocialButton', () => {
  it('renders label and handles click', async () => {
    const onClick = vi.fn()
    render(<SocialButton label="Github" iconSrc="/Github.png" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Github' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
