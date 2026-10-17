import axe from 'axe-core'
import type { AxeResults, Result } from 'axe-core'

// WCAG 2.x level A + AA (levels A and AA are what "second level" means).
export const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

// jsdom has no layout and does not load Tailwind CSS, so axe cannot compute
// colors here. Contrast must be checked in a real browser.
const JSDOM_UNSUPPORTED_RULES = ['color-contrast']

export async function runAxe(context: Element | Document): Promise<AxeResults> {
  return axe.run(context, {
    runOnly: { type: 'tag', values: WCAG_AA_TAGS },
    rules: Object.fromEntries(JSDOM_UNSUPPORTED_RULES.map((id) => [id, { enabled: false }])),
  })
}

export function formatViolations(violations: Result[]): string {
  if (violations.length === 0) return 'no violations'
  return violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => `    - ${node.target.join(' ')}`).join('\n')
      return `[${violation.impact}] ${violation.id}: ${violation.help}\n${violation.helpUrl}\n${targets}`
    })
    .join('\n\n')
}
