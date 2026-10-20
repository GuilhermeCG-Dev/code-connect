import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '../../../contexts/AuthContext'
import { getErrorStatus } from '../../../services/api'
import { createComment, getPost, likePost, listComments, unlikePost } from '../../../services/posts'
import type { Comment, PaginationMeta, PostDetail as PostDetailData } from '../../../services/posts'
import { toggleLike } from '../../../utils/likes'
import { CommentSection } from '../../organisms/CommentSection'
import { PostDetail } from '../../organisms/PostDetail'

// `key` identifies the request the state belongs to; a different key means loading
type PostState =
  | { key: string; status: 'not-found' }
  | { key: string; status: 'error' }
  | { key: string; status: 'ready'; post: PostDetailData }

const commentErrors: Record<number, string> = {
  400: 'O comentário precisa ter entre 1 e 1000 caracteres.',
  401: 'Sua sessão expirou. Faça login novamente.',
}

export function PostDetailPage() {
  const { id = '' } = useParams()
  const { status: authStatus } = useAuth()
  const requestKey = `${id}:${authStatus}`
  const [loaded, setLoaded] = useState<PostState>()
  const state = loaded?.key === requestKey ? loaded : { status: 'loading' as const }
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsMeta, setCommentsMeta] = useState<PaginationMeta>()
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentError, setCommentError] = useState<string>()
  const [likeError, setLikeError] = useState<string>()

  useEffect(() => {
    if (authStatus === 'loading') {
      return
    }
    let active = true
    Promise.all([getPost(id), listComments(id)])
      .then(([post, firstComments]) => {
        if (active) {
          setLoaded({ key: requestKey, status: 'ready', post })
          setComments(firstComments.items)
          setCommentsMeta(firstComments.meta)
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoaded({ key: requestKey, status: getErrorStatus(error) === 404 ? 'not-found' : 'error' })
        }
      })
    return () => {
      active = false
    }
  }, [id, authStatus, requestKey])

  if (state.status === 'loading') {
    return (
      <p role="status" className="text-lg text-field">
        Carregando post...
      </p>
    )
  }

  if (state.status !== 'ready') {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg bg-surface p-10">
        <h1 className="text-2xl font-semibold text-offwhite">
          {state.status === 'not-found' ? 'Post não encontrado' : 'Não foi possível carregar o post'}
        </h1>
        <Link to="/" className="text-lg text-accent underline">
          Voltar para o feed
        </Link>
      </div>
    )
  }

  const { post } = state

  async function handleToggleLike() {
    setLikeError(undefined)
    setLoaded({ key: requestKey, status: 'ready', post: toggleLike(post) })
    try {
      await (post.likedByMe ? unlikePost(post.id) : likePost(post.id))
    } catch {
      setLoaded({ key: requestKey, status: 'ready', post })
      setLikeError('Não foi possível registrar sua curtida. Tente novamente.')
    }
  }

  async function handleComment(body: string) {
    setIsCommenting(true)
    setCommentError(undefined)
    try {
      const comment = await createComment(post.id, body)
      setComments((current) => [comment, ...current])
      setCommentsMeta((meta) => meta && { ...meta, total: meta.total + 1 })
      setLoaded({ key: requestKey, status: 'ready', post: { ...post, commentsCount: post.commentsCount + 1 } })
    } catch (error) {
      setCommentError(commentErrors[getErrorStatus(error) ?? 0] ?? 'Não foi possível enviar o comentário.')
      throw error
    } finally {
      setIsCommenting(false)
    }
  }

  async function handleLoadMore() {
    if (!commentsMeta) {
      return
    }
    const next = await listComments(post.id, commentsMeta.page + 1)
    // Skip comments already shown (new comments shift the pages)
    setComments((current) => [
      ...current,
      ...next.items.filter((item) => !current.some((comment) => comment.id === item.id)),
    ])
    setCommentsMeta(next.meta)
  }

  const isAuthenticated = authStatus === 'authenticated'

  return (
    <>
      {likeError && (
        <p role="alert" className="text-base text-danger">
          {likeError}
        </p>
      )}
      <PostDetail post={post} canInteract={isAuthenticated} onToggleLike={handleToggleLike} />
      <CommentSection
        comments={comments}
        total={commentsMeta?.total ?? comments.length}
        canComment={isAuthenticated}
        hasMore={Boolean(commentsMeta && commentsMeta.page < commentsMeta.totalPages)}
        isSubmitting={isCommenting}
        error={commentError}
        onSubmit={handleComment}
        onLoadMore={handleLoadMore}
      />
    </>
  )
}
