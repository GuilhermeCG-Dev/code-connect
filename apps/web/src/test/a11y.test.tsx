import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import html from '../../index.html?raw'
import App from '../App'
import { AuthProvider } from '../contexts/AuthContext'
import { getProfile } from '../services/auth'
import { getPost, listComments, listPosts } from '../services/posts'
import type { PostDetail } from '../services/posts'
import { saveToken } from '../services/token'
import { formatViolations, runAxe } from './axe'

vi.mock('../services/auth')
vi.mock('../services/posts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/posts')>()),
  listPosts: vi.fn(),
  getPost: vi.fn(),
  listComments: vi.fn(),
}))

const post: PostDetail = {
  id: 'p1',
  title: 'Componentes em React',
  excerpt: 'Resumo do post',
  body: 'Conteúdo do post',
  tags: ['react'],
  thumbnailUrl: null,
  author: { id: 'u1', name: 'Ana Souza' },
  likesCount: 2,
  commentsCount: 1,
  likedByMe: false,
  createdAt: '2026-10-19T12:00:00.000Z',
}

// Each page renders through the real routes; `ready` is text shown once it loaded
const pages = [
  { name: 'LoginPage', path: '/login', ready: 'Boas-vindas! Faça seu login.', loggedIn: false },
  { name: 'SignupPage', path: '/cadastro', ready: 'Já tem conta?', loggedIn: false },
  { name: 'FeedPage', path: '/', ready: 'Resumo do post', loggedIn: false },
  { name: 'FeedPage (logged in)', path: '/', ready: 'Resumo do post', loggedIn: true },
  { name: 'PostDetailPage', path: '/posts/p1', ready: 'Ótimo post!', loggedIn: false },
  { name: 'PostDetailPage (logged in)', path: '/posts/p1', ready: 'Ótimo post!', loggedIn: true },
  { name: 'NewPostPage', path: '/posts/new', ready: 'Novo post', loggedIn: true },
]

describe('accessibility (WCAG 2.x A + AA, automated)', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.mocked(getProfile).mockResolvedValue({ id: 'u1', name: 'Ana', email: 'a@b.c', createdAt: '' })
    vi.mocked(listPosts).mockResolvedValue({ items: [post], meta: { page: 1, limit: 12, total: 1, totalPages: 1 } })
    vi.mocked(getPost).mockResolvedValue(post)
    vi.mocked(listComments).mockResolvedValue({
      items: [{ id: 'c1', body: 'Ótimo post!', author: { id: 'u2', name: 'Bruno' }, createdAt: post.createdAt }],
      meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
    })
  })

  it.each(pages)('$name has no axe violations', async ({ path, ready, loggedIn }) => {
    if (loggedIn) {
      saveToken('token', true)
    }
    const { container } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </AuthProvider>,
    )
    await screen.findAllByText(ready)
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
