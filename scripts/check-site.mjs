import { readFile } from "node:fs/promises";
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

for (const [index, match] of [...routeB.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
  if (match[1].trim()) new Script(match[1], { filename: `route-b-inline-${index + 1}.js` });
}

for (const [index, match] of [...routeC.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].entries()) {
  if (match[1].trim()) new Script(match[1], { filename: `route-c-inline-${index + 1}.js` });
}

for (const needle of [
  "What describes you?",
  "Homeowner",
  "Property manager",
  "Contractor",
  "Commercial",
  "New shower glass",
  "Shower glass replacement",
  "Multiple units",
  "Repair or replace",
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
  "#step-1-property-type",
  "#step-2-homeowner-project",
  "#step-2-business-project",
  "#step-3-contact",
  "#thank-you",
  "background: var(--secondary-dark); color: var(--white)",
  'class="rating-badge" aria-label="Five-star rated on Google"',
  'class="rating-badge-label">Rated on Google',
]) {
  if (!routeB.includes(needle) && !config.includes(needle)) throw new Error(`Missing route /b behavior: ${needle}`);
}

if (!config.includes('metaPixelId: "1072168465554731"')) throw new Error("Meta Pixel ID is not configured.");
if ((config.match(/\{ label: "Contractor", icon: "hard-hat" \}/g) || []).length !== 2) {
  throw new Error("Contractor must be configured once in each of routes /b and /c.");
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

if ((config.match(/Message frequency varies\./g) || []).length !== 3) {
  throw new Error("Every quiz consent disclosure must state that message frequency varies.");
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
]) {
  if (!capi.includes(needle)) throw new Error(`Missing CAPI behavior: ${needle}`);
}

console.log("Validated isolated /b, /c, and /d routing, source-backed offer disclosure, service-specific content, hash-based Clarity steps, implicit consent, Pixel, and CAPI wiring.");
