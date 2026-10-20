import type { ReactNode } from 'react'

type AppTemplateProps = {
  sidebar: ReactNode
  header: ReactNode
  children: ReactNode
}

export function AppTemplate({ sidebar, header, children }: AppTemplateProps) {
  return (
    <div className="min-h-svh bg-page p-4 md:p-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-start md:gap-8">
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <header>{header}</header>
          <main className="flex flex-col gap-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
