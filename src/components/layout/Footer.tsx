import TLink from '../ui/TLink'
import { NAV } from './Header'
import { useContent } from '../../cms/ContentProvider'
import { telHref } from '../../cms/format'

export default function Footer() {
  const { settings: s } = useContent()
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div className="footer__brand">
          <span className="wordmark">ROYAL</span>
          <p>{s.footerBlurb}</p>
        </div>
        <div>
          <h4 className="label">Navigation</h4>
          <ul className="footer__list">
            {NAV.map((n) => (
              <li key={n.to}><TLink to={n.to} className="footer__link">{n.label}</TLink></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="label">Concierge Desk</h4>
          <p className="footer__small">Private Inquiries &amp; Acquisitions</p>
          <ul className="footer__list">
            {s.email && <li><a className="footer__link" href={`mailto:${s.email}`}>{s.email}</a></li>}
            {(s.tollFree || s.phone) && <li><a className="footer__link accent" href={telHref(s.tollFree || s.phone)}>{s.tollFree || s.phone}</a></li>}
            {s.instagram && <li><a className="footer__link" href={s.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>}
            {s.linkedin && <li><a className="footer__link" href={s.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>}
          </ul>
        </div>
        <div>
          <h4 className="label">Offices</h4>
          <ul className="footer__list footer__offices">
            {s.offices.map((o) => (
              <li key={o.city + o.address}><strong>{o.city}</strong>{o.address}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap footer__legal">
        <span>© {new Date().getFullYear()} ROYAL Architectural Real Estate LLC. All rights reserved.</span>
        <span className="footer__legal-links">
          <TLink to="/privacy">Privacy Policy</TLink>
          <TLink to="/terms">Terms of Service</TLink>
          <TLink to="/legal">Legal Notices</TLink>
          <span>Equal Housing Opportunity</span>
        </span>
      </div>
    </footer>
  )
}
