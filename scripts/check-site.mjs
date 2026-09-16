import { readFile } from "node:fs/promises";
import { Script } from "node:vm";

const root = new URL("../", import.meta.url);
const routeB = await readFile(new URL("b/index.html", root), "utf8");
const routeC = await readFile(new URL("c/index.html", root), "utf8");
const config = await readFile(new URL("config.js", root), "utf8");
const capi = await readFile(new URL("functions/api/capi.js", root), "utf8");
const redirects = await readFile(new URL("_redirects", root), "utf8");

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
  "Commercial",
  "New shower glass",
  "Shower glass replacement",
  "Multiple units",
  "Repair or replace",
  "consent_method: 'submit_implied'",
  "sms_consent: true",
  "fetch('/api/capi'",
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
if (!redirects.includes("/b  /b/  301") || redirects.includes("/b/ /index.html")) throw new Error("Route /b redirect is not isolated.");

for (const needle of [
  "Window Replacement & Installation",
  "What describes you?",
  "Homeowner",
  "Property manager",
  "Commercial",
  "New window installation",
  "Window replacement",
  "Multiple windows or units",
  "Repair or replace",
  "const V = C.routeC || {};",
  "consent_method: 'submit_implied'",
  "sms_consent: true",
  "funnel_variant: 'C'",
  "route: '/c'",
  "quiz_path_c",
  "quiz_c_",
  "fetch('/api/capi'",
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

console.log("Validated isolated /b and /c routing, service-specific content, hash-based Clarity steps, implicit consent, Pixel, and CAPI wiring.");
