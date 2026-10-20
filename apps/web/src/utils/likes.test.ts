import { describe, expect, it } from 'vitest'
import type { PostSummary } from '../services/posts'
import { toggleLike } from './likes'

const post: PostSummary = {
  id: 'p1',
  title: 'Post',
  excerpt: '',
  tags: [],
  thumbnailUrl: null,
  author: { id: 'u1', name: 'Ana' },
  likesCount: 2,
  commentsCount: 0,
  likedByMe: false,
  createdAt: '2026-10-19T12:00:00.000Z',
}

describe('toggleLike', () => {
  it('adds and removes the viewer like', () => {
    const liked = toggleLike(post)
    expect(liked).toMatchObject({ likedByMe: true, likesCount: 3 })
    expect(toggleLike(liked)).toMatchObject({ likedByMe: false, likesCount: 2 })
  })
})
