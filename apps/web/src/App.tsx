import { LoginPage } from './components/pages/LoginPage'
import { SignupPage } from './components/pages/SignupPage'

function App() {
  // No router yet: pick the page from the URL path
  if (window.location.pathname === '/cadastro') {
    return <SignupPage />
  }
  return <LoginPage />
}

export default App
