import { Avatar } from '../../atoms/Avatar'

type AuthorBadgeProps = {
  name: string
}

export function AuthorBadge({ name }: AuthorBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-base text-field">
      <Avatar />
      <span>@{toHandle(name)}</span>
    </div>
  )
}

function toHandle(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '')
}
