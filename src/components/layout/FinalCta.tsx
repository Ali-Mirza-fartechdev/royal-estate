import type { Img } from '../../data/images'
import Button from '../ui/Button'

interface Props {
  eyebrow: string
  title: string
  body: string
  primary: { label: string; to: string }
  secondary?: { label: string; to: string }
  image?: Img
}

/** Closing CTA. Sits flush against the footer — no trailing gap. */
export default function FinalCta({ eyebrow, title, body, primary, secondary, image }: Props) {
  return (
    <section className={`fcta ${image ? 'fcta--img' : ''}`}>
      {image && (
        <div className="fcta__bg" aria-hidden="true">
          <img src={image.sm} alt="" loading="lazy" width={image.w} height={image.h} data-parallax="0.06" />
        </div>
      )}
      <div className="wrap fcta__in">
        <p className="eyebrow" data-reveal>{eyebrow}</p>
        <h2 className="h-xl" data-reveal>{title}</h2>
        <p className="lede lede--c" data-reveal>{body}</p>
        <div className="fcta__actions" data-reveal>
          <Button to={primary.to}>{primary.label}</Button>
          {secondary && <Button to={secondary.to} variant="wire" arrow>{secondary.label}</Button>}
        </div>
      </div>
    </section>
  )
}
