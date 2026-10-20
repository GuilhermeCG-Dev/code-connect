import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppTemplate } from './AppTemplate'

describe('AppTemplate', () => {
  it('renders sidebar, header and main content slots', () => {
    render(
      <AppTemplate sidebar={<aside>menu</aside>} header={<form role="search" />}>
        <p>conteúdo</p>
      </AppTemplate>,
    )
    expect(screen.getByRole('complementary')).toHaveTextContent('menu')
    expect(screen.getByRole('banner')).toContainElement(screen.getByRole('search'))
    expect(screen.getByRole('main')).toHaveTextContent('conteúdo')
  })
})
