import { Avatar } from '../../atoms/Avatar'

type CommentItemProps = {
  authorName: string
  body: string
  createdAt: string
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function CommentItem({ authorName, body, createdAt }: CommentItemProps) {
  return (
    <article className="flex gap-4 border-b border-field py-4 last:border-b-0">
      <Avatar size="md" />
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-baseline gap-2">
          <strong className="text-base font-semibold text-offwhite">{authorName}</strong>
          <time dateTime={createdAt} className="text-sm text-field">
            {dateFormat.format(new Date(createdAt))}
          </time>
        </p>
        <p className="text-base whitespace-pre-line text-offwhite">{body}</p>
      </div>
    </article>
  )
}
