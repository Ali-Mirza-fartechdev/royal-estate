# ROYAL — Luxury Real Estate Website

React 19 + TypeScript + Vite, GSAP (+ ScrollTrigger) for motion, React Router for routing.
Built from the supplied Google Stitch designs ("Architectural Monolith" system: obsidian ground, chalk type, amber accent, Space Grotesk + Manrope, zero-radius hairline UI).

## Routes
`/` · `/properties` · `/properties/:slug` · `/neighborhoods` · `/about` · `/contact` · `/journal` · `/journal/:slug` · `/privacy` · `/terms` · `/legal`

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build -> dist/
npm run preview
```

## Project map
- `src/motion/` GSAP registration, shared easings/durations, loader→page "intro" gate
- `src/hooks/usePageMotion.ts` declarative motion driven by `data-*` attributes (`data-hero`, `data-reveal`, `data-stagger`/`data-item`, `data-split`, `data-img-reveal`, `data-parallax`, `data-line`); every page runs inside a scoped `gsap.matchMedia` and is reverted on unmount; reduced-motion users get static content
- `src/components/animation/` `PageLoader`, `PageTransition` (route wipe), `Split` (accessible word reveal), `ImageReveal`
- `src/components/layout|ui|property/` header, footer, hero, buttons, forms, property card, gallery + lightbox
- `src/data/` **sample content** (properties, neighborhoods, journal, image registry)
- `src/assets/img/` photography from the design archive (WebP; `-sm` variants for srcset)

## Behaviour notes
- **Loader**: shown once per browser session. Its progress reflects real readiness (webfonts + the route's priority image), with a hard 4.5 s cap; any key/click skips it. Direct navigation to any route works.
- **Transitions**: internal links route through a dark wipe panel; back/forward navigate instantly. A timed failsafe always releases the panel.
- **Three.js**: intentionally not used — none of the supplied designs call for 3D.

## Contact / inquiry forms
Forms validate client-side. Delivery is **not** wired to a backend. Set `VITE_FORM_ENDPOINT` (see `.env.example`) to any JSON form endpoint, e.g. Formspree (`https://formspree.io/f/xxxx`), and rebuild. Until then the form says plainly that nothing was sent and offers a pre-filled `mailto:` to `concierge@royal-estates.com`.

## Content to replace before launch
Property listings, prices, team members, the Journal articles, the legal pages, office addresses/phones and the "Arthur V. Sterling" quote come from the design mockups or are placeholders. They are centralised in `src/data/` and the page files. Several gallery images reuse the same few photographs — drop real photography into `src/assets/img` and update `src/data/images.ts`.

## Deploy (GitHub + Vercel)
```bash
git remote add origin <your-repo-url>
git push -u origin main
```
Import the repo in Vercel (framework preset: Vite; build `npm run build`; output `dist`). `vercel.json` adds the SPA rewrite so refreshing nested routes works, plus long-term caching for `/assets`.

## Admin panel (client-managed content)

The client manages the site at **`/admin`**: properties for sale and rent (with photo upload, draft/publish, featured), neighborhoods, journal, team, contact/office settings, and an inquiry inbox (mark read, reply, CSV export).

### Demo mode (no setup)
With no Supabase variables the admin runs on browser-local storage so you can try it: open `/admin`, any email + password `royal-demo`. Data lives only in that browser — **not shared with visitors or other devices**. Use it for evaluation, never for production.

### Going live with Supabase (free tier is enough)
1. Create a project at supabase.com.
2. SQL Editor → paste and run `supabase/schema.sql`.
3. Authentication → Users → *Add user* (client's email + strong password, tick auto-confirm). Authentication → Providers → Email → turn **off** "Allow new users to sign up".
4. Project Settings → API: copy the URL and anon key into Vercel env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (and a local `.env`), then redeploy.
5. Sign in at `/admin`. On an empty database the dashboard offers **Import sample content**; replace or delete the samples.

Visitors only ever read *published* rows; only the signed-in admin can write; contact forms can insert into the inbox but not read it (row-level security).

### Client quick guide
- **Add a listing:** Properties → New property → choose *For sale* / *For rent*, add photos (first = cover), fill in basics, switch **Published** on, Save.
- **Hide / mark sold or leased:** change *Availability*, or switch Published off (draft).
- **Order:** use ↑ ↓ on the list; *Featured* listings appear on the home page.
- Photos are resized and converted to WebP in the browser before upload.

> Note: the Supabase adapter was written against the documented API but could not be exercised against a live project in the build sandbox — do a first-run check (create, publish, upload a photo, send a test inquiry) after setup.
