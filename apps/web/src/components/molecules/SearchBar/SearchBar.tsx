import { useState } from 'react'
import type { FormEvent } from 'react'
import { Icon } from '../../atoms/Icon'

type SearchBarProps = {
  defaultValue?: string
  onSearch: (query: string) => void
}

export function SearchBar({ defaultValue = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [syncedDefault, setSyncedDefault] = useState(defaultValue)

  // Follow the URL when it changes outside the form (back button, clear search)
  if (defaultValue !== syncedDefault) {
    setSyncedDefault(defaultValue)
    setQuery(defaultValue)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(query.trim())
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="flex w-full gap-2">
      <label className="flex flex-1 items-center gap-3 rounded-lg bg-surface px-4 py-3 focus-within:outline-2 focus-within:outline-accent">
        <Icon name="search" className="size-5 shrink-0 text-field" />
        <span className="sr-only">Buscar posts</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Digite o que você procura"
          className="w-full bg-transparent text-base text-offwhite placeholder:text-field focus:outline-none"
        />
      </label>
      <button
        type="submit"
        className="cursor-pointer rounded-lg bg-accent px-6 text-base font-semibold text-ink hover:brightness-110"
      >
        Buscar
      </button>
    </form>
  )
}
