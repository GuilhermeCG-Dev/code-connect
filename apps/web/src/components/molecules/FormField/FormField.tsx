import { useId } from 'react'
import type { ComponentProps } from 'react'
import { Input } from '../../atoms/Input'
import { Label } from '../../atoms/Label'

type FormFieldProps = ComponentProps<'input'> & {
  label: string
}

export function FormField({ label, id, ...inputProps }: FormFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input id={inputId} {...inputProps} />
    </div>
  )
}
