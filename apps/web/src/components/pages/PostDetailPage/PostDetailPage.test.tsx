import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import { getProfile } from '../../../services/auth'
import { createComment, getPost, likePost, listComments } from '../../../services/posts'
import type { Comment, PostDetail } from '../../../services/posts'
import { saveToken } from '../../../services/token'
import { PostDetailPage } from './PostDetailPage'

vi.mock('../../../services/auth')
vi.mock('../../../services/posts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../services/posts')>()),
  getPost: vi.fn(),
  listComments: vi.fn(),
  createComment: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

const post: PostDetail = {
  id: 'p1',
  title: 'Componentes em React',
  excerpt: 'Resumo',
  body: 'Conteúdo completo do post.',
  tags: ['react'],
  thumbnailUrl: null,
  author: { id: 'u1', name: 'Ana' },
  likesCount: 0,
  commentsCount: 1,
  likedByMe: false,
  createdAt: '2026-10-19T12:00:00.000Z',
}

const comment: Comment = {
  id: 'c1',
  body: 'Primeiro comentário',
  author: { id: 'u2', name: 'Bruno' },
  createdAt: '2026-10-19T13:00:00.000Z',
}

function httpError(status: number) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data: {},
  })
}

function renderPage() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/posts/p1']}>
        <Routes>
          <Route path="/posts/:id" element={<PostDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

function logIn() {
  saveToken('token', true)
  vi.mocked(getProfile).mockResolvedValue({ id: 'u3', name: 'Carla', email: 'c@d.e', createdAt: '' })
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    sessionStorage.clear()
    vi.mocked(getPost).mockResolvedValue(post)
    vi.mocked(listComments).mockResolvedValue({
      items: [comment],
      meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
    })
  })

  it('shows the post and comments to anonymous users without interactions', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Componentes em React' })).toBeInTheDocument()
    expect(screen.getByText('Primeiro comentário')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Faça login para curtir/ })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Faça login para comentar' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Seu comentário')).not.toBeInTheDocument()
    expect(getPost).toHaveBeenCalledWith('p1')
  })

  it('lets logged users comment', async () => {
    logIn()
    vi.mocked(createComment).mockResolvedValue({
      id: 'c2',
      body: 'Muito bom!',
      author: { id: 'u3', name: 'Carla' },
      createdAt: '2026-10-19T14:00:00.000Z',
    })
    renderPage()

    await userEvent.type(await screen.findByLabelText('Seu comentário'), 'Muito bom!')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(createComment).toHaveBeenCalledWith('p1', 'Muito bom!')
    expect(await screen.findByText('Muito bom!')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Comentários (2)' })).toBeInTheDocument()
  })

  it('lets logged users like the post', async () => {
    logIn()
    vi.mocked(likePost).mockResolvedValue()
    renderPage()

    await userEvent.click(await screen.findByRole('button', { name: 'Curtir (0)' }))

    expect(likePost).toHaveBeenCalledWith('p1')
    expect(screen.getByRole('button', { name: 'Descurtir (1)' })).toBeInTheDocument()
  })

  it('shows a not found message for an unknown post', async () => {
    vi.mocked(getPost).mockRejectedValue(httpError(404))
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Post não encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para o feed' })).toHaveAttribute('href', '/')
  })
})
