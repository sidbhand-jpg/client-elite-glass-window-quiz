import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/lead.js';

const endpoint = 'https://quiz.example/api/lead';
const env = {
  MAKE_QUIZ_WEBHOOK_URL: 'https://hook.example/quiz',
  META_TEST_AUTH: 'test-auth',
  ELITE_TEST_SIGNING_KEY: 'test-signing-key',
};
const lead = {
  route: '/b', lead_event_id: 'evt_relay_123456789012',
  name: 'Synthetic Test', email: 'synthetic@example.com', phone: '2025550199',
};

function request(body, auth) {
  return new Request(endpoint, {
    method: 'POST',
    headers: {
      origin: 'https://quiz.example',
      'content-type': 'application/json',
      'user-agent': 'Relay test browser',
      'CF-Connecting-IP': '203.0.113.10',
      ...(auth ? { 'x-elite-test-auth': auth } : {}),
    },
    body: JSON.stringify(body),
  });
}

test('public test markers and invalid routes stop before Make', async () => {
  const previous = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; throw new Error('unexpected Make call'); };
  try {
    assert.equal((await onRequestPost({ request: request({ ...lead, sample_record: true }), env })).status, 403);
    assert.equal((await onRequestPost({ request: request({ ...lead, route: '/unknown' }), env })).status, 400);
    assert.equal((await onRequestPost({ request: request({ ...lead, name: '' }), env })).status, 400);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = previous; }
});

test('receiver failures and missing acknowledgments never claim success', async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new Error('offline'); };
    assert.equal((await onRequestPost({ request: request(lead), env })).status, 502);
    globalThis.fetch = async () => new Response('Accepted', { status: 200 });
    assert.equal((await onRequestPost({ request: request(lead), env })).status, 502);
  } finally { globalThis.fetch = previous; }
});

test('duplicate acknowledgment remains accepted and does not become a test receipt', async () => {
  const previous = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({ accepted: true, duplicate: true, test: false });
    const response = await onRequestPost({ request: request(lead), env });
    assert.deepEqual(await response.json(), { accepted: true, duplicate: true, test: false });
  } finally { globalThis.fetch = previous; }
});

test('signed synthetic relay sends escaped JSON and original browser metadata', async () => {
  const previous = globalThis.fetch;
  let forwarded;
  try {
    globalThis.fetch = async (_url, options) => {
      forwarded = JSON.parse(options.body);
      return Response.json({ accepted: true, duplicate: false, test: true });
    };
    const response = await onRequestPost({ request: request({ ...lead, name: 'Quote "Test"', sample_record: true }, 'test-auth'), env });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).test, true);
    assert.equal(forwarded.client_ip_address, '203.0.113.10');
    assert.equal(forwarded.user_agent, 'Relay test browser');
    assert.match(forwarded.test_signature, /^[0-9a-f]{64}$/);
    assert.equal(JSON.parse(forwarded.payload_json).name, 'Quote "Test"');
  } finally { globalThis.fetch = previous; }
});
