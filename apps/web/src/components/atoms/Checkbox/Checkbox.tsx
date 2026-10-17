import { useId } from 'react'
import type { ComponentProps } from 'react'

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
  label: string
}

export function Checkbox({ label, id, ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex items-center gap-2">
      <input
        id={inputId}
        type="checkbox"
        className="size-5 cursor-pointer accent-accent"
        {...props}
      />
      <label htmlFor={inputId} className="cursor-pointer text-sm text-muted">
        {label}
      </label>
    </div>
  )
}
