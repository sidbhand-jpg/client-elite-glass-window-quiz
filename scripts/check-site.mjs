import { readFile, readdir, stat } from "node:fs/promises";
import { Script } from "node:vm";

const root = new URL("../", import.meta.url);
const routeB = await readFile(new URL("b/index.html", root), "utf8");
const routeC = await readFile(new URL("c/index.html", root), "utf8");
const config = await readFile(new URL("config.js", root), "utf8");
const capi = await readFile(new URL("functions/api/capi.js", root), "utf8");
const redirects = await readFile(new URL("_redirects", root), "utf8");
const rootRoute = await readFile(new URL("index.html", root), "utf8");
const privacyPolicy = await readFile(new URL("privacy-policy/index.html", root), "utf8");
const terms = await readFile(new URL("terms/index.html", root), "utf8");
const headers = await readFile(new URL("_headers", root), "utf8");

for (const [index, match] of [...routeB.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
  if (match[1].trim()) new Script(match[1], { filename: `route-b-inline-${index + 1}.js` });
}

for (const [index, match] of [...routeC.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
  if (match[1].trim()) new Script(match[1], { filename: `route-c-inline-${index + 1}.js` });
}

for (const [label, page] of [["root", rootRoute], ["/b", routeB], ["/c and /d", routeC]]) {
  for (const forbidden of ["fonts.googleapis.com", "fonts.gstatic.com", "unpkg.com/lucide"]) {
    if (page.includes(forbidden)) throw new Error(`${label} still depends on ${forbidden}.`);
  }
  for (const required of ["/assets/fonts/fonts.css", "/assets/vendor/lucide-0.468.0.min.js"]) {
    if (!page.includes(required)) throw new Error(`${label} is missing optimized critical asset markup: ${required}`);
  }
}

for (const [label, page] of [["/b", routeB], ["/c and /d", routeC]]) {
  if (!page.includes('barlow-condensed-latin-700-normal-v1.woff2" as="font"')) {
    throw new Error(`${label} must prioritize the first-question heading font.`);
  }
}

if (routeB.includes('class="hero-media"') || /<link rel="preload" as="image"/.test(routeB)) {
  throw new Error("Route /b still loads a hero background image.");
}
if (!routeC.includes('if (isWindowOffer)') || !routeC.includes('data-src="/assets/projects/window_redmond_main.jpg"') || /<link rel="preload" as="image"/.test(routeC)) {
  throw new Error("Only route /d may preload and display the shared window hero image.");
}
if (!rootRoute.includes('class="route-hero-media"') || !rootRoute.includes('as="image"')) {
  throw new Error("The main quiz hero image must remain in place.");
}

for (const required of [
  "data-srcset=\"${item.sources.avif}\"",
  "galleryObserver.observe(galleryCarousel)",
  "loadGalleryItem(galleryIndex + 1)",
  "decoding=\"async\"",
]) {
  if (!rootRoute.includes(required)) throw new Error(`Root route is missing lazy responsive image behavior: ${required}`);
}

for (const required of ["media: {", "rootHero: {", "routeBHero: {", "routeCHero: {", "sources: { avif:"]) {
  if (!config.includes(required)) throw new Error(`Config is missing responsive image metadata: ${required}`);
}

for (const required of [
  "/assets/optimized/*",
  "/assets/fonts/*",
  "/assets/vendor/*",
  "Cache-Control: public, max-age=31536000, immutable",
  "/config.js",
  "Cache-Control: public, max-age=0, must-revalidate",
]) {
  if (!headers.includes(required)) throw new Error(`Missing Cloudflare cache rule: ${required}`);
}

const optimizedDirectory = new URL("assets/optimized/", root);
const optimizedFiles = (await readdir(optimizedDirectory)).filter((name) => /\.(?:avif|webp)$/.test(name));
if (optimizedFiles.length !== 54) throw new Error(`Expected 54 optimized image variants; found ${optimizedFiles.length}.`);
let optimizedBytes = 0;
for (const name of optimizedFiles) {
  const file = await stat(new URL(name, optimizedDirectory));
  optimizedBytes += file.size;
  if (file.size > 120_000) throw new Error(`Optimized image exceeds the 120 KB budget: ${name}`);
}
if (optimizedBytes > 2_000_000) throw new Error(`Optimized image set exceeds the 2 MB budget: ${optimizedBytes} bytes.`);

for (const asset of [
  "assets/fonts/inter-latin-wght-normal-v1.woff2",
  "assets/fonts/oswald-latin-wght-normal-v1.woff2",
  "assets/fonts/barlow-condensed-latin-600-normal-v1.woff2",
  "assets/fonts/barlow-condensed-latin-700-normal-v1.woff2",
  "assets/fonts/barlow-condensed-latin-800-normal-v1.woff2",
  "assets/vendor/lucide-0.468.0.min.js",
]) {
  const file = await stat(new URL(asset, root));
  if (!file.size) throw new Error(`Required local asset is empty: ${asset}`);
}

const iconBundle = await stat(new URL("assets/vendor/lucide-0.468.0.min.js", root));
if (iconBundle.size > 20_000) throw new Error(`Lucide subset exceeds the 20 KB budget: ${iconBundle.size} bytes.`);

for (const needle of [
  "What kind of shower project do you want to get done?",
  "New shower enclosure",
  "Replace existing shower enclosure",
  "Repair or adjust shower glass",
  "Multiple showers or units",
  "consent_method: 'submit_implied'",
  "sms_consent: true",
  "fetch('/api/capi'",
  "capi_event_name: 'Lead'",
  "capi_event_time: Math.floor(Date.now() / 1000)",
  "capi_action_source: 'website'",
  "fbq('track', 'PageView'",
  "fbq('track', 'Lead'",
  "fbq('set', 'autoConfig', false, C.metaPixelId)",
  "loadClarity();",
  "clarity('set', 'funnelStep', label)",
  "clarity('event', eventName)",
  "#step-1-shower-project",
  "#step-2-contact",
  "#thank-you",
  "Step 1 of 2",
  "property_type: ''",
  "background: var(--secondary-dark); color: var(--white)",
  'class="rating-badge" aria-label="Five-star rated on Google"',
  'class="rating-badge-label">Rated on Google',
]) {
  if (!routeB.includes(needle) && !config.includes(needle)) throw new Error(`Missing route /b behavior: ${needle}`);
}

if (!capi.includes("input.property_type || input.project_need")) {
  throw new Error("Meta CAPI content category must fall back to project_need.");
}

if (!config.includes('metaPixelId: "1072168465554731"')) throw new Error("Meta Pixel ID is not configured.");
if ((config.match(/\{ label: "Contractor", icon: "hard-hat" \}/g) || []).length !== 1) {
  throw new Error("Contractor must remain configured once in route /c only.");
}
if (!redirects.includes("/b  /b/  301") || redirects.includes("/b/ /index.html")) throw new Error("Route /b redirect is not isolated.");

for (const needle of [
  "Window Replacement & Installation",
  "What describes you?",
  "Homeowner",
  "Property manager",
  "Contractor",
  "Commercial",
  "New window installation",
  "Window replacement",
  "Multiple windows or units",
  "Repair or replace",
  "const isOfferRoute = /^\\/d(?:\\/|$)/.test(location.pathname);",
  "const variant = isOfferRoute ? 'D' : 'C';",
  "const routePath = isOfferRoute ? '/d' : '/c';",
  "consent_method: 'submit_implied'",
  "sms_consent: true",
  "funnel_variant: variant",
  "route: routePath",
  "quiz_path_${variantSlug}",
  "quiz_${variantSlug}_",
  "fetch('/api/capi'",
  "capi_event_name: 'Lead'",
  "capi_event_time: Math.floor(Date.now() / 1000)",
  "capi_action_source: 'website'",
  "fbq('track', 'PageView'",
  "fbq('track', 'Lead'",
  "#step-1-property-type",
  "#step-2-homeowner-project",
  "#step-2-business-project",
  "#step-3-contact",
  "#thank-you",
  'class="rating-badge" aria-label="Five-star rated on Google"',
  'class="rating-badge-label">Rated on Google',
]) {
  if (!routeC.includes(needle) && !config.includes(needle)) throw new Error(`Missing route /c behavior: ${needle}`);
}

if (!redirects.includes("/c  /c/  301") || redirects.includes("/c/ /index.html")) throw new Error("Route /c redirect is not isolated.");

for (const needle of [
  'routeD: {',
  'headline: "Windows From $300 Per Window"',
  'name: "$300 per window offer"',
  'display: "$300 per window*"',
  "select Ply Gem window materials only",
  "Labor and installation are not included",
  "final pricing is confirmed after product selection and measurements",
  "offer_name: V.offer?.name || ''",
  "offer_display: V.offer?.display || ''",
  "offer_disclaimer: V.offer?.disclaimer || ''",
  "asterisk.className = 'offer-asterisk'",
]) {
  if (!routeC.includes(needle) && !config.includes(needle)) throw new Error(`Missing route /d offer behavior: ${needle}`);
}

if (!redirects.includes("/d  /d/  301") || !redirects.includes("/d/*  /c/:splat  200")) {
  throw new Error("Route /d must resolve to the shared Windows funnel without changing the public /d URL.");
}

for (const needle of [
  '{ label: "Privacy Policy", href: "/privacy-policy/" }',
  '{ label: "Terms & Conditions", href: "/terms/" }',
]) {
  if (!config.includes(needle)) throw new Error(`Missing same-site legal link: ${needle}`);
}

if ((config.match(/By submitting, you agree to receive marketing texts and emails from \{businessName\}\./g) || []).length !== 2) {
  throw new Error("Routes B and C must use the approved marketing text and email disclosure.");
}

if ((config.match(/Message frequency varies\./g) || []).length !== 2) {
  throw new Error("Route D and the shared consent disclosure must retain their existing message frequency terms.");
}

for (const [label, page, needles] of [
  ["Privacy Policy", privacyPolicy, ["Information We Collect", "Calls and Text Messages", "will not be shared with third parties or affiliates for their marketing or promotional purposes", "Cookies, Analytics, and Advertising", "Your Privacy Choices", "sales@eliteglassandwindow.com"]],
  ["Terms & Conditions", terms, ["Estimates and Service Requests", "Call and Text Message Terms", "Consent is not a condition of purchase", "Governing Law", "sales@eliteglassandwindow.com"]],
]) {
  for (const needle of needles) {
    if (!page.includes(needle)) throw new Error(`Missing ${label} content: ${needle}`);
  }
  if (!page.includes('href="/"')) throw new Error(`${label} is missing a link back to the quiz.`);
}

if (!redirects.includes("/privacy-policy  /privacy-policy/  301") || !redirects.includes("/terms  /terms/  301")) {
  throw new Error("Same-site legal route redirects are not configured.");
}

for (const needle of [
  "fbq('track', 'PageView', {}, { eventID: pageEventId })",
  "event_name: 'PageView'",
  "event_name: 'Lead'",
  "fetch('/api/capi'",
  "capi_event_name: 'Lead'",
  "capi_event_time: Math.floor(Date.now() / 1000)",
  "capi_action_source: 'website'",
  "sample_record",
  "TEST ONLY - ${C.businessName} Quiz",
]) {
  if (!rootRoute.includes(needle)) throw new Error(`Missing root /a tracking behavior: ${needle}`);
}

for (const [label, route] of [["/b", routeB], ["/c and /d", routeC]]) {
  for (const needle of ["sample_record", "TEST ONLY - ${C.businessName} Quiz"]) {
    if (!route.includes(needle)) throw new Error(`Missing ${label} test labeling behavior: ${needle}`);
  }
}

for (const needle of [
  'new Set(["PageView", "Lead"])',
  "META_CAPI_ACCESS_TOKEN",
  "META_TEST_EVENT_CODE",
  "META_TEST_AUTH",
  "crypto.subtle.digest",
  "event_id: eventId",
  'action_source: "website"',
  'request.headers.get("origin") !== requestUrl.origin',
  'sourcePath.startsWith("/d")',
  '"Route D $300 window offer"',
]) {
  if (!capi.includes(needle)) throw new Error(`Missing CAPI behavior: ${needle}`);
}

console.log("Validated isolated /b, /c, and /d routing, source-backed offer disclosure, service-specific content, hash-based Clarity steps, implicit consent, Pixel, and CAPI wiring.");
