import { useState } from 'react'

type PostThumbnailProps = {
  /** null when the post has no thumbnail. */
  src: string | null
  alt: string
  className?: string
}

export const THUMBNAIL_PLACEHOLDER = '/thumbnail-placeholder.png'

/** className sets the height (default h-32), the image always covers the full width. */
export function PostThumbnail({ src, alt, className = 'h-32' }: PostThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showPlaceholder = !src || failedSrc === src

  return (
    <img
      src={showPlaceholder ? THUMBNAIL_PLACEHOLDER : src}
      alt={showPlaceholder ? `${alt} (sem imagem)` : alt}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className={`w-full rounded-lg object-cover ${className}`}
    />
  )
}
