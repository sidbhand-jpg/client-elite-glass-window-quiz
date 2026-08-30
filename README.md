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
| Meta Pixel | Not configured | `metaPixelId` is empty |
| Lead webhook | Not configured | `webhookUrl` is empty |

The funnel can be completed while the Meta Pixel or webhook is empty. However, an empty webhook means the submitted lead is not sent to an external CRM or automation platform.

## Project Structure

```text
├── index.html                  # Funnel UI, behavior, attribution, and tracking
├── config.js                  # Elite Glass & Window content and integrations
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

The final form collects name, email, phone number, ZIP code, and required SMS consent. A successful submission displays the thank-you screen and click-to-call option.

### Funnel Variants

The project includes two routes for testing different landing experiences:

| Route | Variant | Experience |
|---|---|---|
| `/a` | A | Direct landing experience without the gallery and review proof sections |
| `/b` or `/` | B | Landing experience with project gallery and customer reviews |

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

- <http://127.0.0.1:4173/> for variant B
- <http://127.0.0.1:4173/a> for variant A

## Configuration

Edit `config.js` to change project content. The main sections are:

| Section | Purpose |
|---|---|
| Business fields | Name, phone, hours, tagline, and logo |
| `colors` | Brand palette and page surfaces |
| `lander` | Hero copy, trust points, CTA, and hero image |
| `gallery` | Project categories and local image assets |
| `reviews` | Google rating, review count, and displayed testimonials |
| `questions` | Quiz questions, answer choices, icons, and images |
| `form` | Contact-form copy and fields |
| `thankYou` | Submission confirmation and call CTA |
| Tracking fields | Clarity, Meta Pixel, and webhook configuration |
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

All funnel imagery is stored in `assets/`; there is no remote stock-photo dependency. When replacing an image, keep the same filename or update its matching path and alt text in `config.js`.

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

### Meta Pixel

Meta Pixel support is implemented but currently disabled because `metaPixelId` is empty.

Once a valid Pixel ID is added, the funnel fires:

| Event | When | Details |
|---|---|---|
| `PageView` | Initial page load | Standard Meta event |
| `FunnelStep` | Each funnel step | Custom event with step label and variant |
| `Lead` | Valid form submission | Includes `eventID` for CAPI deduplication |

Enable it in `config.js`:

```js
metaPixelId: "YOUR_META_PIXEL_ID"
```

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

## SMS Compliance

The contact form requires an SMS consent checkbox. Its copy is controlled by `smsConsentText`, where `{businessName}` is replaced at runtime.

Keep the `STOP` and `HELP` language intact when editing the disclosure. The configured Privacy Policy and Terms of Use links are displayed with the consent copy and in the footer.

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
- [ ] Lead webhook URL
- [ ] Meta Pixel ID
- [ ] Real end-to-end lead delivery test
- [ ] Meta browser and server event deduplication test, if CAPI is enabled
- [ ] Desktop and mobile visual acceptance after the final deployment

## Important Operational Notes

- `config.js` is the canonical configuration file; do not rename it to `CONFIG.js`.
- Empty tracking or webhook values disable those integrations safely.
- A thank-you screen does not prove that an empty or misconfigured webhook delivered the lead.
- Static endpoint checks do not replace a real browser submission and receiver-side verification.
- Keep generated project imagery local unless a deliberate asset migration is planned.
