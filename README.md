# Elite Glass & Window Quiz Funnel

A standalone, config-driven lead-generation quiz for Elite Glass & Window. It helps residential and commercial prospects identify their project needs and request a free estimate.

The funnel is a static site with no build step. Business details, brand styling, proof content, questions, tracking IDs, and lead-delivery settings are stored in `config.js`.

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
├── b/index.html                # Dedicated conditional shower-glass funnel
├── config.js                  # Elite Glass & Window content and integrations
├── functions/api/capi.js       # Server-side Meta PageView and Lead delivery
├── _redirects                 # Cloudflare Pages routes for variants A and B
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

Route `/b` starts with Homeowner, Property manager, and Commercial. Homeowners then choose New shower glass or Shower glass replacement; property managers and commercial visitors choose New install, Multiple units, or Repair or replace. The final form collects name, email, phone number, and ZIP code.

Route `/b` uses submit-implied marketing consent instead of a checkbox. The disclosure remains visible immediately above the submit button, and successful payloads record `sms_consent: true`, `marketing_consent: true`, and `consent_method: submit_implied`.

The quiz does not use phone routing. On a valid form submission it posts the payload only to the configured webhook.

### Funnel Variants

The project includes two routes for testing different landing experiences:

| Route | Variant | Experience |
|---|---|---|
| `/a` | A | Direct landing experience without the gallery and review proof sections |
| `/b` | B | Dedicated mobile-first shower-glass funnel with conditional audience routing |
| `/` | Legacy B | Existing five-question landing experience with gallery and review proof |

The active variant is included in tracking events and webhook submissions as `A` or `B`.

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
- <http://127.0.0.1:4173/b/> for the conditional shower-glass funnel

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
| `footerLinks` | Privacy Policy and Terms of Use destinations |

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
- `funnelVariant`: `A` or `B`
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

Route `/b` uses its own three-step conditional hash sequence:

| Route `/b` screen | Hash | Clarity event |
|---|---|---|
| Property type | `#step-1-property-type` | `quiz_b_step_1_property_type` |
| Homeowner project | `#step-2-homeowner-project` | `quiz_b_step_2_homeowner_project` |
| Property manager/commercial project | `#step-2-business-project` | `quiz_b_step_2_business_project` |
| Contact form | `#step-3-contact` | `quiz_b_step_3_contact` |
| Thank-you screen | `#thank-you` | `quiz_b_thank_you` |

Each `/b` render updates `funnelStep`; its one-time custom event records that the visitor reached the screen. Route assignment is recorded as `quiz_path_b`.

### Meta Pixel

Meta Pixel dataset `1072168465554731` is configured. Route `/b` fires:

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

The browser sends a JSON `POST` request using `no-cors` mode. A representative payload is:

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
    "project_type": "Window replacement",
    "property_type": "Single-family home",
    "top_priority": "Energy efficiency",
    "timeline": "Within 1 month",
    "budget": "$7,500 – $15,000"
  },
  "attribution": {
    "utm_source": "facebook",
    "utm_medium": "paid",
    "utm_campaign": "window-replacement",
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

The frontend cannot read a response body in `no-cors` mode. Confirm delivery using the receiving platform’s execution log and a real test submission.

## Contact Consent

Route `/b` has no consent checkbox. Submitting the form records agreement to the visible marketing-call and text-message disclosure. Its route-specific copy is controlled by `routeB.form.consentText`, where `{businessName}` is replaced at runtime.

Keep the automated-technology, consent-not-required, message/data-rate, `STOP`, and `HELP` language intact. Privacy Policy and Terms of Use links are displayed with the disclosure and in the footer.

## Cloudflare Pages Deployment

This repository is already connected to Cloudflare Pages. Normal release flow:

```powershell
git add README.md config.js index.html assets _redirects
git commit -m "Describe the change"
git push origin main
```

Only stage files that are intentionally part of the release. After pushing, verify both the homepage and `config.js` return HTTP 200 and confirm the deployment in Cloudflare Pages.

## Pre-Launch Checklist

- [x] Elite Glass & Window business details and brand colors
- [x] Local logo, favicon, hero, gallery, and question imagery
- [x] Five glass and window project questions
- [x] Google rating summary and selected customer reviews
- [x] Privacy Policy and Terms of Use links
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
