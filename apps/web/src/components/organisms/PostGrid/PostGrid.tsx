import type { PostSummary } from '../../../services/posts'
import { PostCard } from '../PostCard'

type PostGridProps = {
  posts: PostSummary[]
  query?: string
  canInteract: boolean
  onToggleLike: (post: PostSummary) => void
}

export function PostGrid({ posts, query, canInteract, onToggleLike }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <p role="status" className="rounded-lg bg-surface p-8 text-center text-lg text-offwhite">
        {query ? `Nenhum post encontrado para "${query}".` : 'Ainda não há posts publicados.'}
      </p>
    )
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <li key={post.id} className="flex">
          <PostCard post={post} canInteract={canInteract} onToggleLike={onToggleLike} />
        </li>
      ))}
    </ul>
  )
}
