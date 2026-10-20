import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Icon } from './Icon'
import type { IconName } from './Icon'

const names: IconName[] = [
  'account-circle',
  'arrow-forward',
  'assignment',
  'chat',
  'code',
  'feed',
  'info',
  'login',
  'logout',
  'search',
  'share',
  'thumb-up',
  'thumb-up-outline',
]

describe('Icon', () => {
  it.each(names)('renders a hidden svg for %s', (name) => {
    const { container } = render(<Icon name={name} />)
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toHaveAttribute('data-icon', name)
    expect(svg?.querySelector('path')?.getAttribute('d')).toBeTruthy()
  })
})
