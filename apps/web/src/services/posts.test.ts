import type { InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { api } from './api'
import { assetUrl, createComment, createPost, likePost, listPosts, unlikePost } from './posts'

function stubAdapter(data: unknown = {}) {
  const adapter = vi.fn(async (config: InternalAxiosRequestConfig) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }))
  api.defaults.adapter = adapter
  return adapter
}

describe('posts service', () => {
  it('sends search, sort and page as query params', async () => {
    const adapter = stubAdapter({ items: [], meta: {} })

    await listPosts({ q: 'react', sort: 'popular', page: 2 })

    const config = adapter.mock.calls[0][0]
    expect(config.url).toBe('/posts')
    expect(config.params).toEqual({ q: 'react', sort: 'popular', page: 2 })
  })

  it('sends a new post as multipart form data with the thumbnail', async () => {
    const adapter = stubAdapter({ id: '1' })
    const thumbnail = new File(['png'], 'capa.png', { type: 'image/png' })

    await createPost({ title: 'Título', body: 'Corpo', tags: 'react, css', thumbnail })

    const form = adapter.mock.calls[0][0].data as FormData
    expect(form).toBeInstanceOf(FormData)
    expect(form.get('title')).toBe('Título')
    expect(form.get('tags')).toBe('react, css')
    expect(form.get('thumbnail')).toBe(thumbnail)
  })

  it('likes with PUT and unlikes with DELETE', async () => {
    const adapter = stubAdapter()

    await likePost('1')
    await unlikePost('1')

    expect(adapter.mock.calls.map(([config]) => [config.method, config.url])).toEqual([
      ['put', '/posts/1/like'],
      ['delete', '/posts/1/like'],
    ])
  })

  it('posts a comment body', async () => {
    const adapter = stubAdapter({ id: 'c1' })

    await createComment('1', 'Legal!')

    expect(adapter.mock.calls[0][0].url).toBe('/posts/1/comments')
    expect(JSON.parse(adapter.mock.calls[0][0].data)).toEqual({ body: 'Legal!' })
  })

  it('prefixes upload paths with the API base URL', () => {
    expect(assetUrl('/uploads/a.png')).toBe('/api/uploads/a.png')
    expect(assetUrl(null)).toBeNull()
  })
})
