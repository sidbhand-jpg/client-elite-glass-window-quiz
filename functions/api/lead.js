const encoder = new TextEncoder();

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function sameSecret(received, expected) {
  if (!received || !expected || received.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < received.length; index += 1) mismatch |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0;
}

async function signTest(secret, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return json({ accepted: false, error: 'Origin not allowed' }, 403);
  if (!env.MAKE_QUIZ_WEBHOOK_URL) return json({ accepted: false, error: 'Lead intake unavailable' }, 503);

  const auth = request.headers.get('x-elite-test-auth');
  const isTest = auth !== null;
  if (isTest && (!env.META_TEST_AUTH || !env.ELITE_TEST_SIGNING_KEY || !sameSecret(auth, env.META_TEST_AUTH))) {
    return json({ accepted: false, error: 'Test mode unavailable' }, 403);
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 32768) throw new Error('Too large');
    body = JSON.parse(raw);
  } catch {
    return json({ accepted: false, error: 'Invalid JSON' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ accepted: false, error: 'Invalid submission' }, 400);
  const route = String(body.route || '/').trim();
  if (!['/', '/a', '/b', '/c', '/d'].includes(route)) return json({ accepted: false, error: 'Invalid route' }, 400);
  const eventId = String(body.lead_event_id || '').trim();
  if (!/^evt_[A-Za-z0-9_-]{12,120}$/.test(eventId)) return json({ accepted: false, error: 'Invalid event ID' }, 400);
  if (!String(body.name || '').trim() || !String(body.email || '').trim() || !String(body.phone || '').trim()) {
    return json({ accepted: false, error: 'Contact details are required' }, 400);
  }
  if (body.sample_record && !isTest) return json({ accepted: false, error: 'Unauthorized test marker' }, 403);

  const submittedAt = new Date().toISOString();
  const forwarded = {
    ...body,
    route,
    submitted_at: submittedAt,
    sample_record: isTest,
    client_ip_address: request.headers.get('CF-Connecting-IP') || '',
    user_agent: String(request.headers.get('user-agent') || '').slice(0, 500),
  };
  if (isTest) {
    forwarded.test_signature = await signTest(env.ELITE_TEST_SIGNING_KEY, `${eventId}|${submittedAt}|${route}`);
  } else {
    delete forwarded.test_signature;
  }
  // Make maps this pre-serialized value into its raw JSON HTTP body. This
  // preserves escaping in contact details without putting them in the URL.
  forwarded.payload_json = JSON.stringify(forwarded);

  let response;
  try {
    response = await fetch(env.MAKE_QUIZ_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(forwarded),
    });
  } catch {
    return json({ accepted: false, error: 'Lead intake unavailable' }, 502);
  }
  const receipt = await response.json().catch(() => null);
  if (!response.ok || receipt?.accepted !== true) return json({ accepted: false, error: 'Lead intake was not confirmed' }, 502);
  if (isTest && receipt.test !== true) return json({ accepted: false, error: 'Test intake was not confirmed' }, 502);
  if (!isTest && receipt.test === true) return json({ accepted: false, error: 'Lead intake was not confirmed' }, 502);
  return json({ accepted: true, duplicate: receipt.duplicate === true, test: receipt.test === true });
}
