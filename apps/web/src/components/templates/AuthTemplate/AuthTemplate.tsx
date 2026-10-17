import type { ReactNode } from 'react'
import { ChainDecoration } from '../../atoms/ChainDecoration'

type AuthTemplateProps = {
  bannerSrc: string
  bannerAlt: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthTemplate({
  bannerSrc,
  bannerAlt,
  children,
  footer,
}: AuthTemplateProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-page p-4">
      <ChainDecoration className="absolute -top-16 left-[7%] hidden h-96 md:block" />
      <ChainDecoration className="absolute -right-4 -bottom-20 hidden h-112 md:block" />

      <div className="relative grid w-full max-w-5xl gap-10 rounded-4xl bg-surface p-6 md:grid-cols-[auto_1fr] md:p-19">
        <img
          src={bannerSrc}
          alt={bannerAlt}
          className="hidden h-157 w-102 object-cover md:block"
        />
        <div className="flex flex-col justify-between gap-8 md:w-80">
          <div className="flex flex-col gap-8">{children}</div>
          {footer}
        </div>
      </div>
    </main>
  )
}
