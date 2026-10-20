import { Link } from 'react-router'
import { Icon } from '../../atoms/Icon'
import { Logo } from '../../atoms/Logo'
import { NavItem } from '../../molecules/NavItem'

type SidebarProps = {
  isAuthenticated: boolean
  onSignOut: () => void
}

export function Sidebar({ isAuthenticated, onSignOut }: SidebarProps) {
  return (
    <aside className="flex shrink-0 flex-col items-center gap-8 rounded-lg bg-surface px-4 py-6 md:w-44 md:gap-14 md:py-10">
      <Link to="/" aria-label="CodeConnect, ir para o feed">
        <Logo className="h-10 w-auto md:h-14" />
      </Link>
      {isAuthenticated && (
        <Link
          to="/posts/new"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent px-4 py-3 text-base text-accent transition hover:bg-accent hover:text-ink"
        >
          <Icon name="code" className="size-5" />
          Publicar
        </Link>
      )}
      <nav aria-label="Menu principal" className="w-full">
        <ul className="flex justify-around gap-2 md:flex-col md:gap-6">
          <li>
            <NavItem icon="feed" label="Feed" to="/" />
          </li>
          <li>
            {isAuthenticated ? (
              <NavItem icon="logout" label="Sair" onClick={onSignOut} />
            ) : (
              <NavItem icon="login" label="Login" to="/login" />
            )}
          </li>
        </ul>
      </nav>
    </aside>
  )
}
