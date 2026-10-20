type SortOption<T extends string> = {
  value: T
  label: string
}

type SortTabsProps<T extends string> = {
  options: SortOption<T>[]
  value: T
  onChange: (value: T) => void
}

export function SortTabs<T extends string>({ options, value, onChange }: SortTabsProps<T>) {
  return (
    <div role="group" aria-label="Ordenar posts" className="flex gap-6">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer border-b-2 pb-1 text-lg transition ${
              active ? 'border-accent text-accent' : 'border-transparent text-field hover:text-offwhite'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
