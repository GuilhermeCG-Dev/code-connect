import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Button } from '../../atoms/Button'
import { Label } from '../../atoms/Label'
import { Textarea } from '../../atoms/Textarea'

type CommentFormProps = {
  onSubmit: (body: string) => Promise<void> | void
  isSubmitting?: boolean
  error?: string
}

export function CommentForm({ onSubmit, isSubmitting = false, error }: CommentFormProps) {
  const [body, setBody] = useState('')

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = body.trim()
    if (!text) {
      return
    }
    try {
      await onSubmit(text)
      setBody('')
    } catch {
      // the page shows the error, keep the text so the user can retry
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Label htmlFor="comment-body">Seu comentário</Label>
      <Textarea
        id="comment-body"
        rows={3}
        maxLength={1000}
        required
        placeholder="Escreva um comentário"
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      {error && (
        <p role="alert" className="text-base text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="self-end">
        Comentar
      </Button>
    </form>
  )
}
