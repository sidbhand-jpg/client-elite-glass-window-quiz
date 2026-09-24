# Elite Glass & Window Quiz Funnel

A standalone, config-driven lead-generation quiz for Elite Glass & Window. It helps residential and commercial prospects identify their project needs and request a free estimate.

The deployed funnel uses static pages and two Cloudflare Pages Functions. Business details, brand styling, proof content, questions, and public tracking IDs are stored in `config.js`. Server secrets and the Make destination stay in the Pages secret store.

## Live Project

- Production: <https://client-elite-glass-window-quiz.pages.dev>
- GitHub: <https://github.com/sidbhand-jpg/client-elite-glass-window-quiz>
- Deployment: Cloudflare Pages connected to the `main` branch

Pushing to `main` automatically creates a new Cloudflare Pages deployment.

## Current Integration Status

| Integration | Status | Configuration |
|---|---|---|
| Microsoft Clarity | Active | Project ID `yadrhyi60g` |
| Meta Pixel | Active | Dataset `1072168465554731`; quiz events pair browser and server with a shared event ID |
| Meta Conversions API | Active | `/api/capi` hashes available identifiers server-side; the access token is a Pages secret |
| Lead relay | Active | `/api/lead` sends JSON to Make and requires the client-app receiver acknowledgment |
| Immediate AI call | Disabled | Quiz submissions use the Make webhook and do not initiate phone routing |

Never place Meta, Clarity, Make, or test authentication secrets in browser code, Git, or the Pages static output. `npm run deploy` builds an allowlisted `dist/` directory to exclude `.env` and private tooling.

## Project Structure

```text
├── index.html                  # Existing root and /a funnel UI
├── a/index.html                # Route A mirror of the root quiz, preserving /a/ on Pages
├── b/index.html                # Dedicated two-step shower-glass funnel
├── c/index.html                # Shared conditional window funnel for /c and /d
├── config.js                  # Elite Glass & Window content and integrations
├── functions/api/capi.js       # Server-side Meta PageView and Lead delivery
├── _redirects                 # Cloudflare Pages routes for variants A through D
├── README.md                  # Project setup and handoff documentation
└── assets/
    ├── logo.svg
    ├── favicon.svg
    ├── elite-glass-hero.png
    ├── window-replacement.png
    ├── shower-enclosure.png
    ├── custom-glass-mirror.png
    └── glass-railing-storefront.png
```

`config.js` is lowercase and is loaded by `index.html` as `./config.js`. Keep that filename and casing unchanged when deploying.

## Funnel Experience

The landing page introduces Elite Glass & Window, displays project imagery, Google review proof, and a five-star Google badge. The visitor then answers five questions:

1. Project type
2. Property type
3. Top project priority
4. Desired timeline
5. Investment range

Route `/b` asks one required shower-project question: New shower enclosure, Replace existing shower enclosure, Repair or adjust shower glass, or Multiple showers or units. The second and final screen collects name, email, phone number, and ZIP code.

Route `/c` follows the same conditional flow for windows. Homeowners choose New window installation or Window replacement; property managers, contractors, and commercial visitors choose New window installation, Multiple windows or units, or Repair or replace. It uses the completed Redmond window project as its hero image.

Route `/d` uses the same window flow as `/c` and adds the source-backed `$300 per window*` offer. Its visible asterisk states that the starting price is for select Ply Gem window materials only; labor and installation are excluded, other products and project requirements cost more, and final pricing follows product selection and measurements. Offer details are also included in the webhook payload.

Routes `/b`, `/c`, and `/d` use submit-implied marketing consent instead of a checkbox. The disclosure remains visible immediately above the submit button, and successful payloads record `sms_consent: true`, `marketing_consent: true`, and `consent_method: submit_implied`.

The quiz does not use phone routing. On a valid form submission it posts the payload only to the configured webhook.

### Funnel Variants

The project includes four routes for testing different landing experiences:

| Route | Variant | Experience |
|---|---|---|
| `/a` | A | Direct landing experience without the gallery and review proof sections |
| `/b` | B | Dedicated mobile-first two-step shower-glass funnel |
| `/c` | C | Dedicated mobile-first window funnel with conditional audience routing |
| `/d` | D | Route C window flow with a source-backed `$300 per window*` material-only offer |
| `/` | Legacy B | Existing five-question landing experience with gallery and review proof |

The active variant is included in tracking events and webhook submissions as `A`, `B`, `C`, or `D`.

## Local Preview

Because asset paths begin with `/assets/`, preview the project through a local web server instead of opening `index.html` directly as a file.

For a quick variant B preview, run this command from the project directory:

```powershell
python -m http.server 4173
```

Then open <http://127.0.0.1:4173/>. Python's basic static server does not process `_redirects`, so it cannot preview `/a` directly.

To preview both Cloudflare routes locally, use:

```powershell
npx --yes wrangler@latest pages dev . --port 4173
```

Then open:

- <http://127.0.0.1:4173/> for the existing root funnel
- <http://127.0.0.1:4173/a> for variant A
- <http://127.0.0.1:4173/b/> for the two-step shower-glass funnel
- <http://127.0.0.1:4173/c/> for the conditional window funnel
- <http://127.0.0.1:4173/d/> for the window offer funnel

## Performance Assets

Original PNG and JPEG files are retained as browser fallbacks. Production markup prefers responsive AVIF, then WebP, with explicit dimensions to avoid layout movement. The root gallery assigns image URLs only when the carousel approaches the viewport and loads only the current and next slide.

After replacing a source image, update its versioned mapping in `scripts/optimize-assets.mjs` when appropriate and regenerate the committed variants:

```powershell
npm install
npm run optimize:assets
npm run check
```

Do not hand-edit files under `assets/optimized/`. The generator strips metadata and uses AVIF quality 50 and WebP quality 78. Hero sources target 640, 960, and 1440 pixels where the original resolution permits; gallery and option sources target 480 and 960 pixels without upscaling.

`npm run optimize:assets` also rebuilds the pinned local Lucide subset from the icon names in `scripts/build-icons.mjs`. Add any newly configured icon there before regeneration; the generated browser bundle must remain below 20 KB.

Performance acceptance budgets are:

- No optimized image may exceed 120 KB, and the complete optimized image set must remain below 2 MB.
- Mobile Lighthouse median across three runs: Performance 90+, FCP at or below 1.8 seconds, LCP at or below 2.5 seconds, TBT at or below 200 milliseconds, and CLS at or below 0.1.
- Initial transfer: root at or below 1.5 MiB; `/b`, `/c`, and `/d` at or below 700 KiB, excluding telemetry payloads.

Versioned files under `assets/optimized/`, `assets/fonts/`, and `assets/vendor/` receive a one-year immutable browser cache through `_headers`. HTML and `config.js` continue to revalidate so content and configuration deployments remain immediate.

## Configuration

Edit `config.js` to change project content. The main sections are:

| Section | Purpose |
|---|---|
| Business fields | Name, phone, hours, tagline, and logo |
| `colors` | Brand palette and page surfaces |
| `lander` | Hero copy, trust points, CTA, and hero image |
| `gallery` | Completed company projects, locations, and local image assets |
| `reviews` | Google rating, review count, and displayed testimonials |
| `questions` | Quiz questions, answer choices, icons, and images |
| `form` | Contact-form copy and fields |
| `thankYou` | Submission confirmation and call CTA |
| Tracking fields | Clarity, Meta Pixel, and webhook configuration |
| `leadRouterUrl` | Deprecated; keep empty to disable phone routing |
| `footerLinks` | Same-site Privacy Policy and Terms & Conditions destinations |

### Business and Brand Settings

The current configuration uses:

```js
businessName: "Elite Glass & Window",
tagline: "Custom Glass, Windows & Doors for Greater Seattle",
phone: "+1 (425) 890-8233",
logoUrl: "/assets/logo.svg",

colors: {
  primary: "#004080",
  primaryDark: "#002F5F",
  primaryLight: "#2B6EA6"
}
```

### Local Image Assets

All funnel imagery is stored in `assets/`; there is no remote stock-photo dependency. The landing-page slider uses verified Elite Glass & Window case-study photos under `assets/projects/`. When replacing an image, keep the same filename or update its matching path and alt text in `config.js`.

Question options support two layouts:

- `image-grid`: visual cards with a local image, Lucide icon, and label
- `button-list`: full-width choices with a Lucide icon and label

## Tracking and Attribution

### Microsoft Clarity

Clarity is active through:

```js
clarityId: "yadrhyi60g"
```

The funnel sends these Clarity custom properties:

- `funnelName`: `Elite Glass & Window`
- `funnelVariant`: `A`, `B`, `C`, or `D`
- `funnelStep`: the current hash-based step label

The page uses the following funnel hashes:

| Funnel screen | Hash |
|---|---|
| Landing page | `#start` |
| Project type | `#step-1-project_type` |
| Property type | `#step-2-property_type` |
| Top priority | `#step-3-top_priority` |
| Timeline | `#step-4-timeline` |
| Budget | `#step-5-budget` |
| Contact form | `#contact` |
| Thank-you screen | `#thank-you` |

These labels can be used in Clarity to analyze step-level funnel activity and drop-off.

Route `/b` uses a two-step sequence. Routes `/c` and `/d` retain their three-step conditional sequence.

| Route `/b` screen | Hash | Clarity event |
|---|---|---|
| Shower project | `#step-1-shower-project` | `quiz_b_step_1_shower_project` |
| Contact form | `#step-2-contact` | `quiz_b_step_2_contact` |
| Thank-you screen | `#thank-you` | `quiz_b_thank_you` |

Each render updates `funnelStep`; its one-time custom event records that the visitor reached the screen. Route assignment is recorded as `quiz_path_b`, `quiz_path_c`, or `quiz_path_d`.

### Meta Pixel

Meta Pixel dataset `1072168465554731` is configured on `/`, `/a`, `/b`, `/c`, and `/d`:

| Event | When | Details |
|---|---|---|
| `PageView` | Initial page load | Browser Pixel plus server CAPI using the same `event_id` |
| `FunnelStep` | Question or contact step reached | Route, variant, step, and available answer context |
| `ButtonClick` | Estimate start, contact stage, or submit intent | Route, button ID, step, and source URL |
| `Lead` | Receiver acknowledges a new or duplicate submission | Hashed contact fields; browser Pixel plus server CAPI using the same `event_id` |

The public dataset identifier lives in `config.js`:

```js
metaPixelId: "1072168465554731"
```

`functions/api/capi.js` accepts only same-origin quiz events and hashes available contact fields. It forwards actual `_fbp`/`_fbc`, a stable first-party visitor ID, and the visitor IP and user agent. Missing Meta identifiers are omitted. The Client App sends `Schedule` after a confirmed Cal.com booking and `Purchase` after a newly won job with positive value. Those events reuse the original lead attribution and contact fields. An outbox keeps their event IDs stable across retries.

Cloudflare Pages secrets: `META_CAPI_ACCESS_TOKEN`, `MAKE_QUIZ_WEBHOOK_URL`, `ELITE_TEST_SIGNING_KEY`, `META_TEST_AUTH`, and optional `META_TEST_EVENT_CODE`. The Client App Worker also needs `META_CAPI_ACCESS_TOKEN`, `ELITE_TEST_SIGNING_KEY`, `META_TEST_AUTH`, and optional `META_TEST_EVENT_CODE`. Use the same signing key and test auth on both services. Never publish their values.

### Captured Attribution

On page load, the funnel captures attribution in `sessionStorage`:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `ad_id`
- `adset_id`
- `campaign_id`
- `fbclid`
- `_fbp` and `_fbc`
- Stable first-party `visitor_id`
- Source URL
- User agent
- Unique `lead_event_id`

Basic first-touch source, campaign, ad ID, and timestamp values are also saved in `localStorage` once per browser.

## Lead Relay and Safe Tests

The browser posts the completed quiz to the same-origin `/api/lead` relay. The relay attaches the original visitor IP and user agent, sends JSON to the Make webhook, and requires the Client App receiver's structured `accepted` receipt. Only then does the UI show success and emit `Lead`. Make's `notify_eligible = yes` filter allows Gmail, Sheets, and Slack only for a newly accepted production lead.

A protected synthetic request carries `x-elite-test-auth`. The relay signs its event ID, timestamp, and route with `ELITE_TEST_SIGNING_KEY`; the Client App verifies the signature and replies `test: true` without inserting a lead or dispatching the router. A public `sample_record` marker cannot authorize this path. Use synthetic contact values only. Duplicate test event IDs return `duplicate: true`. Verify both the Make execution and receiver receipt, then confirm that lead, booking, alert, call, and notification counts have not changed.

## Contact Consent

Routes `/b`, `/c`, and `/d` have no consent checkbox. Submitting any of these forms records agreement to the visible marketing-call and text-message disclosure. Their route-specific copy is controlled by `routeB.form.consentText` and `routeC.form.consentText`, where `{businessName}` is replaced at runtime; `/d` inherits the `/c` disclosure.

Keep the automated-technology, consent-not-required, message/data-rate, `STOP`, and `HELP` language intact. Privacy Policy and Terms & Conditions links are displayed with the disclosure and in the footer. Both legal pages are hosted inside this quiz at `/privacy-policy/` and `/terms/`.

## Cloudflare Pages Deployment

This repository is already connected to Cloudflare Pages. Normal release flow:

```powershell
git add README.md .env.example .gitignore package.json scripts config.js index.html b c assets functions test privacy-policy terms legal.css _redirects _headers
git commit -m "Describe the change"
git push origin main
```

Only stage files that are intentionally part of the release. After pushing, verify both the homepage and `config.js` return HTTP 200 and confirm the deployment in Cloudflare Pages.

## Pre-Launch Checklist

- [x] Elite Glass & Window business details and brand colors
- [x] Local logo, favicon, hero, gallery, and question imagery
- [x] Five glass and window project questions
- [x] Google rating summary and selected customer reviews
- [x] Same-site Privacy Policy and Terms & Conditions pages
- [x] Microsoft Clarity project ID
- [x] Server-side Make webhook secret and receipt-gated relay
- [x] Worker provider secrets
- [ ] Publish the Retell prompt from `lead-router/AGENT_PROMPT.md`
- [ ] Controlled immediate-call smoke test using an authorized phone
- [x] Meta Pixel ID
- [x] Signed synthetic lead delivery through Make and Client App on all five routes without a lead or notification
- [ ] Authorized production lead acceptance test
- [x] Meta Test Events received for all quiz events, Schedule, and Purchase; shared Pixel/CAPI IDs verified
- [x] Desktop and mobile visual acceptance after the final deployment

## Important Operational Notes

- `config.js` is the canonical configuration file; do not rename it to `CONFIG.js`.
- Missing server secrets make lead delivery fail closed.
- A thank-you screen does not prove that an empty or misconfigured webhook delivered the lead.
- Static endpoint checks do not replace a real browser submission and receiver-side verification.
- Keep generated project imagery local unless a deliberate asset migration is planned.
