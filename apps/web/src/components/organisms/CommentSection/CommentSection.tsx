import { Link } from 'react-router'
import type { Comment } from '../../../services/posts'
import { CommentForm } from '../../molecules/CommentForm'
import { CommentItem } from '../../molecules/CommentItem'

type CommentSectionProps = {
  comments: Comment[]
  total: number
  canComment: boolean
  hasMore: boolean
  isSubmitting?: boolean
  error?: string
  onSubmit: (body: string) => Promise<void>
  onLoadMore: () => void
}

export function CommentSection({
  comments,
  total,
  canComment,
  hasMore,
  isSubmitting,
  error,
  onSubmit,
  onLoadMore,
}: CommentSectionProps) {
  return (
    <section
      id="comentarios"
      aria-labelledby="comentarios-titulo"
      className="flex flex-col gap-6 rounded-lg bg-surface p-6 md:p-10"
    >
      <h2 id="comentarios-titulo" className="text-xl font-semibold text-offwhite">
        Comentários ({total})
      </h2>
      {canComment ? (
        <CommentForm onSubmit={onSubmit} isSubmitting={isSubmitting} error={error} />
      ) : (
        <p className="text-base text-offwhite">
          <Link to="/login" className="text-accent underline">
            Faça login para comentar
          </Link>
        </p>
      )}
      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem authorName={comment.author.name} body={comment.body} createdAt={comment.createdAt} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base text-field">Seja o primeiro a comentar.</p>
      )}
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="cursor-pointer self-center text-base text-accent underline"
        >
          Carregar mais comentários
        </button>
      )}
    </section>
  )
}
