import { Link } from 'react-router'
import { Icon } from '../../atoms/Icon'
import { PostThumbnail } from '../../atoms/PostThumbnail'
import { Tag } from '../../atoms/Tag'
import { ActionButton } from '../../molecules/ActionButton'
import { AuthorBadge } from '../../molecules/AuthorBadge'
import { assetUrl } from '../../../services/posts'
import type { PostSummary } from '../../../services/posts'

type PostCardProps = {
  post: PostSummary
  canInteract: boolean
  onToggleLike: (post: PostSummary) => void
}

export function PostCard({ post, canInteract, onToggleLike }: PostCardProps) {
  const url = `/posts/${post.id}`

  return (
    <article className="relative flex flex-col overflow-hidden rounded-lg bg-surface">
      <div className="bg-field p-6">
        <PostThumbnail src={assetUrl(post.thumbnailUrl)} alt={`Capa do post ${post.title}`} />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h2 className="text-lg font-semibold text-offwhite">
          {/* The overlay makes the whole card clickable; buttons sit above it */}
          <Link to={url} className="after:absolute after:inset-0 hover:text-accent">
            {post.title}
          </Link>
        </h2>
        <p className="flex-1 text-base text-offwhite">{post.excerpt}</p>
        {post.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </ul>
        )}
        <footer className="flex items-end justify-between gap-4">
          <div className="relative z-10 flex gap-4">
            <ActionButton
              icon={post.likedByMe ? 'thumb-up' : 'thumb-up-outline'}
              label={post.likedByMe ? 'Descurtir' : 'Curtir'}
              count={post.likesCount}
              pressed={post.likedByMe}
              disabledReason={canInteract ? undefined : 'Faça login para curtir'}
              onClick={() => onToggleLike(post)}
            />
            <Link
              to={`${url}#comentarios`}
              aria-label={`Comentários (${post.commentsCount})`}
              className="flex flex-col items-center gap-1 rounded p-1 text-sm text-field hover:text-offwhite"
            >
              <Icon name="chat" className="size-5" />
              <span>{post.commentsCount}</span>
            </Link>
          </div>
          <AuthorBadge name={post.author.name} />
        </footer>
      </div>
    </article>
  )
}
