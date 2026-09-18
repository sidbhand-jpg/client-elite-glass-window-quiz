# Elite Glass & Window Quiz Funnel

A standalone, config-driven lead-generation quiz for Elite Glass & Window. It helps residential and commercial prospects identify their project needs and request a free estimate.

The deployed funnel is a static site. Business details, brand styling, proof content, questions, tracking IDs, and lead-delivery settings are stored in `config.js`. A local asset-generation command creates the committed responsive image variants used by the pages.

## Live Project

- Production: <https://client-elite-glass-window-quiz.pages.dev>
- GitHub: <https://github.com/sidbhand-jpg/client-elite-glass-window-quiz>
- Deployment: Cloudflare Pages connected to the `main` branch

Pushing to `main` automatically creates a new Cloudflare Pages deployment.

## Current Integration Status

| Integration | Status | Configuration |
|---|---|---|
| Microsoft Clarity | Active | Project ID `yadrhyi60g` |
| Meta Pixel | Active | Dataset `1072168465554731`; PageView and Lead use browser/server deduplication IDs |
| Meta Conversions API | Active on Cloudflare Pages | `/api/capi` hashes contact identifiers server-side; the access token is a Worker secret |
| Lead webhook | Active | Existing Elite Glass Make webhook |
| Immediate AI call | Disabled | Quiz submissions use the Make webhook and do not initiate phone routing |

The Meta access token must never be placed in `config.js`, browser code, Git, logs, or `.env.example`.

## Project Structure

```text
├── index.html                  # Existing root and /a funnel UI
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

Meta Pixel dataset `1072168465554731` is configured. Routes `/b`, `/c`, and `/d` fire:

| Event | When | Details |
|---|---|---|
| `PageView` | Initial page load | Browser Pixel plus server CAPI using the same `event_id` |
| `Lead` | Valid form submission | Browser Pixel plus server CAPI using the same `event_id` |

The public dataset identifier lives in `config.js`:

```js
metaPixelId: "1072168465554731"
```

`functions/api/capi.js` accepts only same-origin `PageView` and `Lead` events, hashes contact identifiers, and reads `META_CAPI_ACCESS_TOKEN` from the Cloudflare Pages secret store. Protected test delivery additionally requires `META_TEST_EVENT_CODE` and `META_TEST_AUTH`.

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
- Source URL
- User agent
- Unique `lead_event_id`

Basic first-touch source, campaign, ad ID, and timestamp values are also saved in `localStorage` once per browser.

## Lead Webhook

Set `webhookUrl` to a Make, GoHighLevel, Zapier, or compatible HTTPS endpoint:

```js
webhookUrl: "https://your-webhook-endpoint.example"
```

The browser sends a JSON `POST` request with `Content-Type: application/json`. A representative payload is:

```json
{
  "business": "Elite Glass & Window",
  "funnel_variant": "B",
  "submitted_at": "2026-08-30T12:00:00.000Z",
  "contact": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "4255550100",
    "zip": "98052"
  },
  "quiz_answers": {
    "project_need": "New shower enclosure"
  },
  "attribution": {
    "utm_source": "facebook",
    "utm_medium": "paid",
    "utm_campaign": "shower-glass",
    "utm_content": "",
    "utm_term": "",
    "ad_id": "123456",
    "adset_id": "789012",
    "campaign_id": "345678",
    "fbclid": "TESTCLID",
    "fbp": "fb.1.example",
    "fbc": "fb.1.example.TESTCLID",
    "source_url": "https://client-elite-glass-window-quiz.pages.dev/b#contact",
    "user_agent": "Mozilla/5.0 ...",
    "lead_event_id": "evt_1234567890_example"
  },
  "sms_consent": true
}
```

Confirm delivery using the receiving platform's execution log and a real test submission.

## Contact Consent

Routes `/b`, `/c`, and `/d` have no consent checkbox. Submitting any of these forms records agreement to the visible marketing-call and text-message disclosure. Their route-specific copy is controlled by `routeB.form.consentText` and `routeC.form.consentText`, where `{businessName}` is replaced at runtime; `/d` inherits the `/c` disclosure.

Keep the automated-technology, consent-not-required, message/data-rate, `STOP`, and `HELP` language intact. Privacy Policy and Terms & Conditions links are displayed with the disclosure and in the footer. Both legal pages are hosted inside this quiz at `/privacy-policy/` and `/terms/`.

## Cloudflare Pages Deployment

This repository is already connected to Cloudflare Pages. Normal release flow:

```powershell
git add README.md config.js index.html b c assets privacy-policy terms legal.css _redirects
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
- [x] Lead webhook URL
- [x] Worker provider secrets
- [ ] Publish the Retell prompt from `lead-router/AGENT_PROMPT.md`
- [ ] Controlled immediate-call smoke test using an authorized phone
- [x] Meta Pixel ID
- [ ] Real end-to-end lead delivery test
- [x] Meta server PageView and Lead Test Events received; browser PageView and shared event IDs verified
- [x] Desktop and mobile visual acceptance after the final deployment

## Important Operational Notes

- `config.js` is the canonical configuration file; do not rename it to `CONFIG.js`.
- Empty tracking or webhook values disable those integrations safely.
- A thank-you screen does not prove that an empty or misconfigured webhook delivered the lead.
- Static endpoint checks do not replace a real browser submission and receiver-side verification.
- Keep generated project imagery local unless a deliberate asset migration is planned.
