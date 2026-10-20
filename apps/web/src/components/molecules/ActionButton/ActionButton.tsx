import { Icon } from '../../atoms/Icon'
import type { IconName } from '../../atoms/Icon'

type ActionButtonProps = {
  icon: IconName
  label: string
  count?: number
  pressed?: boolean
  /** When set, the button is disabled and this text explains why. */
  disabledReason?: string
  onClick?: () => void
}

export function ActionButton({ icon, label, count, pressed, disabledReason, onClick }: ActionButtonProps) {
  const name = [label, count !== undefined && `(${count})`, disabledReason && `- ${disabledReason}`]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      aria-pressed={pressed}
      disabled={Boolean(disabledReason)}
      title={disabledReason ?? label}
      className={`flex cursor-pointer flex-col items-center gap-1 rounded p-1 text-sm transition hover:text-offwhite disabled:cursor-not-allowed disabled:opacity-60 ${
        pressed ? 'text-accent' : 'text-field'
      }`}
    >
      <Icon name={icon} className="size-5" />
      {count !== undefined && <span>{count}</span>}
    </button>
  )
}
