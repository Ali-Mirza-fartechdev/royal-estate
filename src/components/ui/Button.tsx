import type { ButtonHTMLAttributes, ReactNode } from 'react'
import TLink from './TLink'
import { Arrow } from './Icons'

type Variant = 'solid' | 'wire' | 'text'
interface Common {
  variant?: Variant
  arrow?: boolean
  className?: string
  children: ReactNode
}
type LinkProps = Common & { to: string; onClick?: never } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>
type BtnProps = Common & { to?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>

export default function Button(props: LinkProps | BtnProps) {
  const { variant = 'solid', arrow, className = '', children, to, ...rest } = props as Common & { to?: string } & ButtonHTMLAttributes<HTMLButtonElement>
  const cls = `btn btn--${variant} ${className}`
  const inner = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  )
  if (to) {
    // external / mail / tel links render as plain anchors
    if (/^(mailto:|tel:|https?:)/.test(to))
      return (
        <a className={cls} href={to}>
          {inner}
        </a>
      )
    return (
      <TLink className={cls} to={to}>
        {inner}
      </TLink>
    )
  }
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  )
}
