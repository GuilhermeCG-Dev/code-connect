import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PostForm } from './PostForm'

describe('PostForm', () => {
  it('submits title, body, tags and thumbnail', async () => {
    const onSubmit = vi.fn()
    render(<PostForm onSubmit={onSubmit} />)
    const thumbnail = new File(['png'], 'capa.png', { type: 'image/png' })

    await userEvent.type(screen.getByLabelText('Título'), 'Meu post')
    await userEvent.type(screen.getByLabelText('Conteúdo'), 'Texto do post')
    await userEvent.type(screen.getByLabelText(/Tags/), 'react, css')
    await userEvent.upload(screen.getByLabelText('Imagem de capa (opcional)'), thumbnail)
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Meu post', body: 'Texto do post', tags: 'react, css', thumbnail })
  })

  it('rejects a thumbnail that is too large', async () => {
    const onSubmit = vi.fn()
    render(<PostForm onSubmit={onSubmit} />)
    const big = new File([new Uint8Array(3 * 1024 * 1024)], 'grande.png', { type: 'image/png' })

    await userEvent.upload(screen.getByLabelText('Imagem de capa (opcional)'), big)

    expect(screen.getByRole('alert')).toHaveTextContent('PNG, JPEG ou WebP com até 2 MB')
  })

  it('disables the button while submitting and shows the error', () => {
    render(<PostForm onSubmit={vi.fn()} isSubmitting error="Faça login novamente." />)
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('Faça login novamente.')
  })
})
