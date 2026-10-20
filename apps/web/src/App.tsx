import { Route, Routes } from 'react-router'
import { AppLayout } from './components/pages/AppLayout'
import { FeedPage } from './components/pages/FeedPage'
import { LoginPage } from './components/pages/LoginPage'
import { NewPostPage } from './components/pages/NewPostPage'
import { PostDetailPage } from './components/pages/PostDetailPage'
import { SignupPage } from './components/pages/SignupPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<FeedPage />} />
        <Route path="posts/new" element={<NewPostPage />} />
        <Route path="posts/:id" element={<PostDetailPage />} />
      </Route>
      <Route path="login" element={<LoginPage />} />
      <Route path="cadastro" element={<SignupPage />} />
    </Routes>
  )
}

export default App
