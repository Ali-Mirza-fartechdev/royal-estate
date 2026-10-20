import Page from '../components/layout/Page'
import Button from '../components/ui/Button'

const copy = {
  privacy: { title: 'Privacy Policy', body: ['ROYAL collects only the information you choose to share through our inquiry forms — such as your name, email address, phone number and the details of your request — in order to respond to you.', 'We do not sell personal information. Information is shared only with the advisors and service providers needed to handle your inquiry.', 'To ask about, correct or delete information you have provided, contact concierge@royal-estates.com.'] },
  terms: { title: 'Terms of Service', body: ['The information on this website is provided for general information and does not constitute an offer. Property details, pricing and availability are subject to change and must be verified directly with ROYAL.', 'Imagery is illustrative. All communications are subject to the terms agreed between you and ROYAL.'] },
  legal: { title: 'Legal Notices', body: ['ROYAL Architectural Real Estate LLC. Equal Housing Opportunity.', 'Licensing, brokerage registration and jurisdiction-specific disclosures should be listed here before launch.'] },
} as const

export default function LegalPage({ kind }: { kind: keyof typeof copy }) {
  const c = copy[kind]
  return (
    <Page key={kind} title={c.title} className="legal">
      <div className="wrap legal__in">
        <p className="eyebrow" data-hero>Legal</p>
        <h1 className="h-xl" data-hero>{c.title}</h1>
        <div className="prose" data-hero>{c.body.map((t, i) => <p key={i}>{t}</p>)}
          <p className="dim">Placeholder text — have counsel review and replace this page before launch.</p></div>
        <Button to="/" variant="text" arrow>Back to home</Button>
      </div>
    </Page>
  )
}
