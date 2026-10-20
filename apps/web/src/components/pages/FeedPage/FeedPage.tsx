import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useAuth } from '../../../contexts/AuthContext'
import { likePost, listPosts, unlikePost } from '../../../services/posts'
import type { Paginated, PostSort, PostSummary } from '../../../services/posts'
import { toggleLike } from '../../../utils/likes'
import { Pagination } from '../../molecules/Pagination'
import { SortTabs } from '../../molecules/SortTabs'
import { PostGrid } from '../../organisms/PostGrid'

const sortOptions: { value: PostSort; label: string }[] = [
  { value: 'recent', label: 'Recentes' },
  { value: 'popular', label: 'Populares' },
]

// `key` identifies the request the state belongs to; a different key means loading
type FeedState = { key: string; status: 'error' } | { key: string; status: 'ready'; data: Paginated<PostSummary> }

export function FeedPage() {
  const { status: authStatus } = useAuth()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const sort: PostSort = params.get('sort') === 'popular' ? 'popular' : 'recent'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const requestKey = JSON.stringify([q, sort, page, authStatus])
  const [loaded, setLoaded] = useState<FeedState>()
  const state = loaded?.key === requestKey ? loaded : { status: 'loading' as const }
  const [likeError, setLikeError] = useState<string>()

  useEffect(() => {
    // Wait for the session so likedByMe comes right on the first request
    if (authStatus === 'loading') {
      return
    }
    let active = true
    listPosts({ q: q || undefined, sort, page })
      .then((data) => active && setLoaded({ key: requestKey, status: 'ready', data }))
      .catch(() => active && setLoaded({ key: requestKey, status: 'error' }))
    return () => {
      active = false
    }
  }, [q, sort, page, authStatus, requestKey])

  function updateParams(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    setParams(next)
  }

  function replacePost(updated: PostSummary) {
    setLoaded((current) =>
      current?.status === 'ready'
        ? {
            ...current,
            data: {
              ...current.data,
              items: current.data.items.map((post) => (post.id === updated.id ? updated : post)),
            },
          }
        : current,
    )
  }

  async function handleToggleLike(post: PostSummary) {
    setLikeError(undefined)
    replacePost(toggleLike(post))
    try {
      await (post.likedByMe ? unlikePost(post.id) : likePost(post.id))
    } catch {
      replacePost(post)
      setLikeError('Não foi possível registrar sua curtida. Tente novamente.')
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-offwhite">{q ? `Resultados para "${q}"` : 'Feed'}</h1>
        <SortTabs
          options={sortOptions}
          value={sort}
          onChange={(value) => updateParams({ sort: value === 'recent' ? null : value, page: null })}
        />
      </div>
      {likeError && (
        <p role="alert" className="text-base text-danger">
          {likeError}
        </p>
      )}
      {state.status === 'loading' && (
        <p role="status" className="text-lg text-field">
          Carregando posts...
        </p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="text-lg text-danger">
          Não foi possível carregar os posts. Tente novamente.
        </p>
      )}
      {state.status === 'ready' && (
        <>
          <PostGrid
            posts={state.data.items}
            query={q}
            canInteract={authStatus === 'authenticated'}
            onToggleLike={handleToggleLike}
          />
          <Pagination
            page={state.data.meta.page}
            totalPages={state.data.meta.totalPages}
            onPageChange={(next) => updateParams({ page: next === 1 ? null : String(next) })}
          />
        </>
      )}
    </>
  )
}
