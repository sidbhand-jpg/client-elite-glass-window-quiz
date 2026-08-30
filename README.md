# Elite Glass & Window Quiz

Standalone, config-driven estimate quiz adapted for Elite Glass & Window.

## Preview

Serve this directory with any static web server, then open `index.html`.

## Funnel variants

- `/a` — Type A short-form landing experience
- `/b` — Type B landing experience with project gallery and Google review proof
- `/` — defaults to Type B

The paths share the same quiz, configuration, lead submission, and tracking implementation.

## Before launch

Set the live values in `config.js` for:

- `webhookUrl`
- `metaPixelId`
- `clarityId`

The quiz still completes when these values are empty, but no lead destination or analytics integration is activated.

Generated image assets are stored locally in `assets/`; no remote stock-photo dependency is used.

## Deployment

- GitHub: https://github.com/sidbhand-jpg/client-elite-glass-window-quiz
- Cloudflare Pages: https://client-elite-glass-window-quiz.pages.dev

Cloudflare Pages is connected to the `main` branch and automatically deploys new pushes.
