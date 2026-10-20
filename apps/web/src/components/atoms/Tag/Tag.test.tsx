import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tag } from './Tag'

describe('Tag', () => {
  it('renders the tag as a list item', () => {
    render(
      <ul>
        <Tag>react</Tag>
      </ul>,
    )
    expect(screen.getByRole('listitem')).toHaveTextContent('react')
  })
})
