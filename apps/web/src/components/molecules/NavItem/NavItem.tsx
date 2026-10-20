import { NavLink } from 'react-router'
import { Icon } from '../../atoms/Icon'
import type { IconName } from '../../atoms/Icon'

type NavItemProps = {
  icon: IconName
  label: string
} & ({ to: string; onClick?: never } | { to?: never; onClick: () => void })

const base =
  'flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg px-2 py-2 text-base transition hover:text-offwhite md:flex-row md:gap-4'

export function NavItem({ icon, label, to, onClick }: NavItemProps) {
  const content = (
    <>
      <Icon name={icon} className="size-6" />
      {label}
    </>
  )

  if (to === undefined) {
    return (
      <button type="button" onClick={onClick} className={`${base} text-field`}>
        {content}
      </button>
    )
  }

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `${base} ${isActive ? 'text-offwhite' : 'text-field'}`}
    >
      {content}
    </NavLink>
  )
}
