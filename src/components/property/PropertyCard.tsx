import type { Property } from '../../cms/types'
import { formatPrice, formatSqft, listingLabel } from '../../cms/format'
import TLink from '../ui/TLink'
import { Arrow, Bookmark } from '../ui/Icons'
import ImageReveal from '../animation/ImageReveal'

interface Props {
  p: Property
  badge?: string
  reveal?: boolean
  eager?: boolean
  saved?: boolean
  onToggleSave?: () => void
}

export default function PropertyCard({ p, badge, reveal = false, eager, saved, onToggleSave }: Props) {
  return (
    <article className="card pcard" data-item>
      <div className="pcard__media">
        <ImageReveal image={p.hero} alt={`${p.name}, ${p.city}, ${p.stateCode}`} reveal={reveal} position={p.heroPosition} priority={eager} className="pcard__frame" />
        <span className="tag pcard__tag">{badge ?? `${p.city}, ${p.stateCode}`}</span>
        {onToggleSave && (
          <button type="button" className="pcard__save" aria-pressed={!!saved} onClick={onToggleSave}>
            <span className="sr-only">{saved ? `Remove ${p.name} from dossier` : `Save ${p.name} to dossier`}</span>
            <Bookmark filled={saved} />
          </button>
        )}
      </div>
      <div className="pcard__body">
        <p className="label dim">{p.area}</p>
        <h3 className="h-md pcard__name">
          <TLink to={`/properties/${p.slug}`} className="stretched">{p.name}</TLink>
        </h3>
        <p className="pcard__price">{formatPrice(p)} <span className={`pcard__type pcard__type--${p.status === 'available' ? p.listingType : 'closed'}`}>{listingLabel(p)}</span></p>
        <ul className="specs">
          <li>{p.beds} Beds</li>
          <li>{p.baths} Baths</li>
          <li>{formatSqft(p.sqft)} sq ft</li>
        </ul>
        <span className="textlink pcard__cta">View property <Arrow /></span>
      </div>
    </article>
  )
}
