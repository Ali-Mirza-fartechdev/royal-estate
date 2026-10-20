import type { ReactNode } from 'react'
import type { Img } from '../../data/images'
import Split from '../animation/Split'

interface Props {
  eyebrow: string
  title: string
  lede?: string
  image?: Img
  imagePosition?: string
  actions?: ReactNode
  compact?: boolean
  children?: ReactNode
}

/** Shared cinematic page hero. Elements animate in via [data-hero]. */
export default function PageHero({ eyebrow, title, lede, image, imagePosition, actions, compact, children }: Props) {
  return (
    <section className={`phero ${compact ? 'phero--compact' : ''} ${image ? 'phero--img' : ''}`}>
      {image && (
        <div className="phero__bg">
          <img data-hero-bg data-priority src={image.src} srcSet={`${image.sm} 720w, ${image.src} ${image.w}w`} sizes="100vw" width={image.w} height={image.h} alt="" fetchPriority="high" style={imagePosition ? { objectPosition: imagePosition } : undefined} />
          <div className="phero__shade" />
        </div>
      )}
      <div className="wrap phero__content">
        <p className="eyebrow" data-hero>{eyebrow}</p>
        <h1 className="h-xl phero__title" aria-label={title.replace(/\n/g, ' ')} data-hero>
          {title.split('\n').map((l, i, a) => (
            <span key={i} aria-hidden="true">{l}{i < a.length - 1 && <br />}</span>
          ))}
        </h1>
        {lede && <p className="lede" data-hero>{lede}</p>}
        {actions && <div className="phero__actions" data-hero>{actions}</div>}
        {children}
      </div>
    </section>
  )
}

export function SectionHead({ eyebrow, title, lede, right }: { eyebrow?: string; title: string; lede?: string; right?: ReactNode }) {
  return (
    <div className="shead">
      <div>
        {eyebrow && <p className="eyebrow" data-reveal>{eyebrow}</p>}
        <Split text={title} className="h-lg" />
        {lede && <p className="lede lede--sm" data-reveal>{lede}</p>}
      </div>
      {right && <div className="shead__right" data-reveal>{right}</div>}
    </div>
  )
}
