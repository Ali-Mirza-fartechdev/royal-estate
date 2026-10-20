import Page from '../components/layout/Page'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <Page title="Page not found" className="legal">
      <div className="wrap legal__in">
        <p className="eyebrow" data-hero>Error 404</p>
        <h1 className="h-xl" data-hero>This address doesn’t exist.</h1>
        <p className="lede" data-hero>The page you’re looking for may have moved. Let’s get you back to the collection.</p>
        <div className="row" data-hero><Button to="/properties">View properties</Button><Button to="/" variant="wire">Home</Button></div>
      </div>
    </Page>
  )
}
