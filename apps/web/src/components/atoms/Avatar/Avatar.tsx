type AvatarProps = {
  src?: string | null
  /** Empty when the name is shown next to the avatar. */
  alt?: string
  size?: 'sm' | 'md'
}

const sizes = {
  sm: 'size-8',
  md: 'size-10',
}

export const DEFAULT_AVATAR = '/avatar-default.png'

export function Avatar({ src, alt = '', size = 'sm' }: AvatarProps) {
  return (
    <img
      src={src || DEFAULT_AVATAR}
      alt={alt}
      className={`shrink-0 rounded-full object-cover ${sizes[size]}`}
      onError={(event) => {
        if (!event.currentTarget.src.endsWith(DEFAULT_AVATAR)) {
          event.currentTarget.src = DEFAULT_AVATAR
        }
      }}
    />
  )
}
