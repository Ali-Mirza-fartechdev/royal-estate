import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useGo } from '../animation/PageTransition'

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
}

/** Router link that routes through the page-transition panel. */
export default function TLink({ to, onClick, children, ...rest }: Props) {
  const go = useGo()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === '_blank') return
    e.preventDefault()
    go(to)
  }
  return (
    <Link to={to} onClick={handle} {...rest}>
      {children}
    </Link>
  )
}
