import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import html from '../../index.html?raw'
import { LoginPage } from '../components/pages/LoginPage'
import { SignupPage } from '../components/pages/SignupPage'
import { formatViolations, runAxe } from './axe'

const pages = [
  { name: 'LoginPage', element: <LoginPage /> },
  { name: 'SignupPage', element: <SignupPage /> },
]

describe('accessibility (WCAG 2.x A + AA, automated)', () => {
  it.each(pages)('$name has no axe violations', async ({ element }) => {
    const { container } = render(element)
    const { violations } = await runAxe(container)
    expect(violations, formatViolations(violations)).toEqual([])
  })

  // The document shell is not rendered by React, so check index.html directly.
  describe('index.html', () => {
    it('declares the page language (WCAG 3.1.1)', () => {
      expect(html).toMatch(/<html[^>]*\slang="[a-zA-Z-]+"/)
    })

    it('has a non-empty title (WCAG 2.4.2)', () => {
      expect(html).toMatch(/<title>\s*\S[^<]*<\/title>/)
    })

    it('does not block zoom in the viewport meta (WCAG 1.4.4)', () => {
      expect(html).not.toMatch(/user-scalable\s*=\s*(no|0)/)
      expect(html).not.toMatch(/maximum-scale\s*=\s*1(\.0)?\b/)
    })
  })
})
