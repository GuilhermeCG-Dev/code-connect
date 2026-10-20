import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, SyntheticEvent } from 'react'
import { Button } from '../../atoms/Button'
import { Heading } from '../../atoms/Heading'
import { Label } from '../../atoms/Label'
import { PostThumbnail } from '../../atoms/PostThumbnail'
import { Textarea } from '../../atoms/Textarea'
import { FormField } from '../../molecules/FormField'

export type PostFormValues = {
  title: string
  body: string
  tags: string
  thumbnail?: File
}

type PostFormProps = {
  onSubmit: (values: PostFormValues) => void
  isSubmitting?: boolean
  error?: string
}

const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024
const THUMBNAIL_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export function PostForm({ onSubmit, isSubmitting = false, error }: PostFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [thumbnail, setThumbnail] = useState<File>()
  const [preview, setPreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string>()

  const previewRef = useRef<string | null>(null)

  // Free the preview URL when the form goes away
  useEffect(() => () => revokePreview(previewRef.current), [])

  function showPreview(file: File | undefined) {
    revokePreview(previewRef.current)
    // jsdom has no createObjectURL
    const url = file && typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null
    previewRef.current = url
    setPreview(url)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setFileError(undefined)
    if (file && (!THUMBNAIL_TYPES.includes(file.type) || file.size > MAX_THUMBNAIL_BYTES)) {
      setFileError('A imagem precisa ser PNG, JPEG ou WebP com até 2 MB.')
      setThumbnail(undefined)
      showPreview(undefined)
      event.target.value = ''
      return
    }
    setThumbnail(file)
    showPreview(file)
  }

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({ title: title.trim(), body, tags, thumbnail })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg bg-surface p-6 md:p-10">
      <Heading>Novo post</Heading>
      <FormField
        label="Título"
        required
        minLength={3}
        maxLength={150}
        placeholder="Sobre o que é o seu post?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor="post-body">Conteúdo</Label>
        <Textarea
          id="post-body"
          required
          rows={8}
          maxLength={10000}
          placeholder="Escreva seu post"
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </div>
      <FormField
        label="Tags (separadas por vírgula, até 5)"
        placeholder="react, css"
        value={tags}
        onChange={(event) => setTags(event.target.value)}
      />
      <div className="flex flex-col gap-2">
        <Label htmlFor="post-thumbnail">Imagem de capa (opcional)</Label>
        <input
          id="post-thumbnail"
          type="file"
          accept={THUMBNAIL_TYPES.join(',')}
          onChange={handleFileChange}
          className="text-base text-offwhite file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-ink"
        />
        {fileError && (
          <p role="alert" className="text-base text-danger">
            {fileError}
          </p>
        )}
        <div className="bg-field p-6">
          <PostThumbnail src={preview} alt="Prévia da capa" className="h-48" />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="self-end">
        Publicar
      </Button>
    </form>
  )
}

function revokePreview(url: string | null) {
  if (url) {
    URL.revokeObjectURL(url)
  }
}
