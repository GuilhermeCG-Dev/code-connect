import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth } from '../../../contexts/AuthContext'
import { getErrorStatus } from '../../../services/api'
import { createPost } from '../../../services/posts'
import { PostForm } from '../../organisms/PostForm'
import type { PostFormValues } from '../../organisms/PostForm'

const errorMessages: Record<number, string> = {
  400: 'Verifique os campos. O título precisa ter de 3 a 150 caracteres, até 5 tags e a imagem até 2 MB.',
  401: 'Sua sessão expirou. Faça login novamente.',
}
const fallbackError = 'Não foi possível publicar o post. Tente novamente.'

export function NewPostPage() {
  const { status } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()

  if (status === 'loading') {
    return (
      <p role="status" className="text-lg text-field">
        Carregando...
      </p>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace />
  }

  async function handleSubmit(values: PostFormValues) {
    setIsSubmitting(true)
    setError(undefined)
    try {
      const post = await createPost(values)
      navigate(`/posts/${post.id}`)
    } catch (err) {
      setError(errorMessages[getErrorStatus(err) ?? 0] ?? fallbackError)
      setIsSubmitting(false)
    }
  }

  return <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} error={error} />
}
