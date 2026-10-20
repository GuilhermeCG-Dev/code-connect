import { Outlet, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../../../contexts/AuthContext'
import { SearchBar } from '../../molecules/SearchBar'
import { Sidebar } from '../../organisms/Sidebar'
import { AppTemplate } from '../../templates/AppTemplate'

// Shared layout of the feed, post detail and new post routes
export function AppLayout() {
  const { status, signOut } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  function handleSearch(query: string) {
    navigate(query ? `/?${new URLSearchParams({ q: query })}` : '/')
  }

  return (
    <AppTemplate
      sidebar={<Sidebar isAuthenticated={status === 'authenticated'} onSignOut={signOut} />}
      header={<SearchBar defaultValue={params.get('q') ?? ''} onSearch={handleSearch} />}
    >
      <Outlet />
    </AppTemplate>
  )
}
