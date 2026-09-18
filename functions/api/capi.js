const encoder = new TextEncoder();

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function cleanPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 10 ? `1${digits}` : digits;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashedValues(values) {
  const normalized = values.map(normalize).filter(Boolean);
  return Promise.all(normalized.map(sha256));
}

function validEventId(value) {
  return /^evt_[A-Za-z0-9_-]{12,120}$/.test(value);
}

function sameSecret(received, expected) {
  if (!received || !expected || received.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < received.length; index += 1) {
    mismatch |= received.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function onRequestPost({ request, env }) {
  const requestUrl = new URL(request.url);
  if (request.headers.get("origin") !== requestUrl.origin) {
    return json({ ok: false, error: "Origin not allowed" }, 403);
  }

  if (!env.META_PIXEL_ID || !env.META_CAPI_ACCESS_TOKEN) {
    return json({ ok: false, error: "CAPI is not configured" }, 503);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const eventName = String(input.event_name || "").trim();
  if (!new Set(["PageView", "Lead"]).has(eventName)) {
    return json({ ok: false, error: "Unsupported event" }, 400);
  }

  const eventId = String(input.event_id || "").trim();
  if (!validEventId(eventId)) {
    return json({ ok: false, error: "Invalid event ID" }, 400);
  }

  const isTest = input.test_event === true;
  if (isTest) {
    const testAuth = request.headers.get("x-meta-test-auth") || "";
    if (!env.META_TEST_EVENT_CODE || !sameSecret(testAuth, env.META_TEST_AUTH || "")) {
      return json({ ok: false, error: "Test mode unavailable" }, 403);
    }
  }

  const email = normalize(input.email);
  const phone = cleanPhone(input.phone);
  if (eventName === "Lead" && (!email || !phone)) {
    return json({ ok: false, error: "Lead email and phone are required" }, 400);
  }

  const nameParts = normalize(input.name).split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() || "";
  const lastName = nameParts.join(" ");
  const userData = {
    em: await hashedValues([email]),
    ph: await hashedValues([phone]),
    fn: await hashedValues([firstName]),
    ln: await hashedValues([lastName]),
    zp: await hashedValues([String(input.zip || "").slice(0, 5)]),
    country: await hashedValues(["us"]),
    client_ip_address: request.headers.get("CF-Connecting-IP") || undefined,
    client_user_agent: String(input.user_agent || request.headers.get("user-agent") || "").slice(0, 500),
    fbp: String(input.fbp || "").slice(0, 255) || undefined,
    fbc: String(input.fbc || "").slice(0, 255) || undefined,
  };
  Object.keys(userData).forEach((key) => {
    const value = userData[key];
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) delete userData[key];
  });

  let sourceUrl = `${requestUrl.origin}/b/`;
  try {
    const candidate = new URL(String(input.source_url || sourceUrl));
    if (candidate.origin === requestUrl.origin) sourceUrl = candidate.href;
  } catch {
    // Keep the verified same-origin route.
  }

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: sourceUrl,
    user_data: userData,
  };
  if (eventName === "Lead") {
    const sourcePath = new URL(sourceUrl).pathname;
    const contentName = sourcePath.startsWith("/d")
      ? "Route D $300 window offer"
      : sourcePath.startsWith("/c")
        ? "Route C window estimate"
        : sourcePath.startsWith("/b")
          ? "Route B shower glass estimate"
          : "Elite Glass & Window estimate quiz";
    event.custom_data = {
      content_name: contentName,
      content_category: String(input.property_type || input.project_need || "").slice(0, 100),
    };
  }

  const payload = { data: [event] };
  if (isTest) payload.test_event_code = env.META_TEST_EVENT_CODE;

  const metaResponse = await fetch(`https://graph.facebook.com/${encodeURIComponent(env.META_PIXEL_ID)}/events`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.META_CAPI_ACCESS_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const metaBody = await metaResponse.json().catch(() => ({}));

  if (!metaResponse.ok || metaBody.events_received !== 1) {
    console.error("Meta CAPI rejected event", metaResponse.status, metaBody.error?.code || "unknown");
    return json({ ok: false, error: "Meta rejected the event" }, 502);
  }

  return json({ ok: true, events_received: 1, event_name: eventName, event_id: eventId, mode: isTest ? "test" : "live" });
}
