import { api } from './api'

export type Author = {
  id: string
  name: string
}

export type PostSummary = {
  id: string
  title: string
  excerpt: string
  tags: string[]
  thumbnailUrl: string | null
  author: Author
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  createdAt: string
}

export type PostDetail = PostSummary & {
  body: string
}

export type Comment = {
  id: string
  body: string
  author: Author
  createdAt: string
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Paginated<T> = {
  items: T[]
  meta: PaginationMeta
}

export type PostSort = 'recent' | 'popular'

export type ListPostsParams = {
  q?: string
  sort?: PostSort
  page?: number
  limit?: number
}

export type CreatePostRequest = {
  title: string
  body: string
  tags: string
  thumbnail?: File
}

const baseURL = import.meta.env.VITE_API_URL ?? '/api'

// The API returns upload paths (/uploads/...) relative to its own origin
export function assetUrl(path: string | null): string | null {
  return path ? `${baseURL}${path}` : null
}

export async function listPosts(params: ListPostsParams = {}): Promise<Paginated<PostSummary>> {
  const response = await api.get<Paginated<PostSummary>>('/posts', { params })
  return response.data
}

export async function getPost(id: string): Promise<PostDetail> {
  const response = await api.get<PostDetail>(`/posts/${id}`)
  return response.data
}

export async function createPost({ title, body, tags, thumbnail }: CreatePostRequest): Promise<PostDetail> {
  const form = new FormData()
  form.append('title', title)
  form.append('body', body)
  form.append('tags', tags)
  if (thumbnail) {
    form.append('thumbnail', thumbnail)
  }
  const response = await api.post<PostDetail>('/posts', form)
  return response.data
}

export async function likePost(id: string): Promise<void> {
  await api.put(`/posts/${id}/like`)
}

export async function unlikePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}/like`)
}

export async function listComments(postId: string, page = 1): Promise<Paginated<Comment>> {
  const response = await api.get<Paginated<Comment>>(`/posts/${postId}/comments`, {
    params: { page },
  })
  return response.data
}

export async function createComment(postId: string, body: string): Promise<Comment> {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, { body })
  return response.data
}
