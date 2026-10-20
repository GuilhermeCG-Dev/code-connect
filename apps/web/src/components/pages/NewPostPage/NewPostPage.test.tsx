import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../../contexts/AuthContext'
import { getProfile } from '../../../services/auth'
import { createPost } from '../../../services/posts'
import type { PostDetail } from '../../../services/posts'
import { saveToken } from '../../../services/token'
import { NewPostPage } from './NewPostPage'

vi.mock('../../../services/auth')
vi.mock('../../../services/posts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../services/posts')>()),
  createPost: vi.fn(),
}))

function renderPage() {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/posts/new']}>
        <Routes>
          <Route path="/posts/new" element={<NewPostPage />} />
          <Route path="/posts/:id" element={<p>página do post</p>} />
          <Route path="/login" element={<p>página de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('NewPostPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('redirects anonymous users to the login page', () => {
    renderPage()
    expect(screen.getByText('página de login')).toBeInTheDocument()
  })

  it('publishes the post and opens it', async () => {
    saveToken('token', true)
    vi.mocked(getProfile).mockResolvedValue({ id: 'u1', name: 'Ana', email: 'a@b.c', createdAt: '' })
    vi.mocked(createPost).mockResolvedValue({ id: 'p9' } as PostDetail)
    renderPage()

    await userEvent.type(await screen.findByLabelText('Título'), 'Meu post')
    await userEvent.type(screen.getByLabelText('Conteúdo'), 'Texto')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(createPost).toHaveBeenCalledWith({ title: 'Meu post', body: 'Texto', tags: '', thumbnail: undefined })
    expect(await screen.findByText('página do post')).toBeInTheDocument()
  })

  it('shows an error when publishing fails', async () => {
    saveToken('token', true)
    vi.mocked(getProfile).mockResolvedValue({ id: 'u1', name: 'Ana', email: 'a@b.c', createdAt: '' })
    vi.mocked(createPost).mockRejectedValue(new Error('Network Error'))
    renderPage()

    await userEvent.type(await screen.findByLabelText('Título'), 'Meu post')
    await userEvent.type(screen.getByLabelText('Conteúdo'), 'Texto')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível publicar o post.')
  })
})
