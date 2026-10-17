import type { ReactNode } from 'react'
import { ChainDecoration } from '../../atoms/ChainDecoration'

type AuthTemplateProps = {
  bannerSrc: string
  bannerAlt: string
  /** Banner height on desktop, as a Tailwind class (each design frame crops its banner differently). */
  bannerHeightClass?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthTemplate({
  bannerSrc,
  bannerAlt,
  bannerHeightClass = 'h-156',
  children,
  footer,
}: AuthTemplateProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-page p-4">
      <ChainDecoration className="absolute -top-2 left-36 hidden md:block" />
      <ChainDecoration className="absolute right-36 bottom-0 hidden md:block" />

      <div className="relative flex w-full max-w-5xl flex-col gap-6 rounded-4xl border border-page bg-surface p-6 md:flex-row md:items-center md:justify-between md:px-20 md:py-14">
        <img
          src={bannerSrc}
          alt={bannerAlt}
          className={`hidden w-100 shrink-0 object-cover md:block ${bannerHeightClass}`}
        />
        <div className="flex flex-col gap-6 md:w-104 md:px-8">
          <div className="flex flex-col gap-8">{children}</div>
          {footer}
        </div>
      </div>
    </main>
  )
}
