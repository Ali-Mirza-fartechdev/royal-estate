import type { Img } from '../../data/images'

interface Props {
  image: Img
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  position?: string
  parallax?: number
  reveal?: boolean
  small?: boolean
}

/** Fixed-ratio image frame with optional clip reveal + parallax. No layout shift. */
export default function ImageReveal({ image, alt, className = '', priority, position, parallax, reveal = true, small }: Props) {
  const src = small ? image.sm : image.src
  return (
    <div className={`frame ${className}`} data-img-reveal={reveal ? '' : undefined} style={{ aspectRatio: `${image.w} / ${image.h}` }}>
      <img
        src={src}
        srcSet={`${image.sm} 720w, ${image.src} ${image.w}w`}
        sizes="(max-width: 800px) 100vw, 50vw"
        alt={alt}
        width={image.w}
        height={image.h}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const, 'data-priority': '' } : {})}
        data-parallax={parallax}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  )
}
