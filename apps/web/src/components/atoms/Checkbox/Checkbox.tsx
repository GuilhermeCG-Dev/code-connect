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
      <span className="relative flex">
        <input
          id={inputId}
          type="checkbox"
          className="peer size-6 cursor-pointer appearance-none rounded border-2 border-field focus-visible:outline-2 focus-visible:outline-accent"
          {...props}
        />
        <img
          src="/check.svg"
          alt=""
          aria-hidden="true"
          width={16}
          height={16}
          className="pointer-events-none absolute top-1 left-1 hidden peer-checked:block"
        />
      </span>
      <label htmlFor={inputId} className="cursor-pointer text-base text-field">
        {label}
      </label>
    </div>
  )
}
