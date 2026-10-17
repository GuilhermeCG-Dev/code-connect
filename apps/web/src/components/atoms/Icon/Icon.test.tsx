import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders hidden svg for each name', () => {
    const { container, rerender } = render(<Icon name="arrow-forward" />)
    expect(container.querySelector('svg[aria-hidden="true"]')).toHaveAttribute('data-icon', 'arrow-forward')
    rerender(<Icon name="assignment" />)
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'assignment')
    rerender(<Icon name="login" />)
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'login')
  })
})
