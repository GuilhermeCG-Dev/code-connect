import { Icon } from '../../atoms/Icon'
import { PostThumbnail } from '../../atoms/PostThumbnail'
import { Tag } from '../../atoms/Tag'
import { ActionButton } from '../../molecules/ActionButton'
import { AuthorBadge } from '../../molecules/AuthorBadge'
import { assetUrl } from '../../../services/posts'
import type { PostDetail as PostDetailData } from '../../../services/posts'

type PostDetailProps = {
  post: PostDetailData
  canInteract: boolean
  onToggleLike: () => void
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })

export function PostDetail({ post, canInteract, onToggleLike }: PostDetailProps) {
  return (
    <article className="overflow-hidden rounded-lg bg-surface">
      <div className="bg-field p-6">
        <PostThumbnail
          src={assetUrl(post.thumbnailUrl)}
          alt={`Capa do post ${post.title}`}
          className="h-48 md:h-75"
        />
      </div>
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-offwhite">{post.title}</h1>
          <time dateTime={post.createdAt} className="text-sm text-field">
            {dateFormat.format(new Date(post.createdAt))}
          </time>
        </header>
        <p className="text-lg whitespace-pre-line text-offwhite">{post.body}</p>
        {post.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </ul>
        )}
        <footer className="flex items-end justify-between gap-4">
          <div className="flex gap-4">
            <ActionButton
              icon={post.likedByMe ? 'thumb-up' : 'thumb-up-outline'}
              label={post.likedByMe ? 'Descurtir' : 'Curtir'}
              count={post.likesCount}
              pressed={post.likedByMe}
              disabledReason={canInteract ? undefined : 'Faça login para curtir'}
              onClick={onToggleLike}
            />
            <a
              href="#comentarios"
              aria-label={`Comentários (${post.commentsCount})`}
              className="flex flex-col items-center gap-1 rounded p-1 text-sm text-field hover:text-offwhite"
            >
              <Icon name="chat" className="size-5" />
              <span>{post.commentsCount}</span>
            </a>
          </div>
          <AuthorBadge name={post.author.name} />
        </footer>
      </div>
    </article>
  )
}
