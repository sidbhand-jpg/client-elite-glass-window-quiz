(function (global) {
  'use strict';

  function cookie(name) {
    return document.cookie.split(';').map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || '';
  }

  function eventId(kind) {
    const random = crypto.getRandomValues(new Uint32Array(2));
    return `evt_${kind}_${Date.now()}_${random[0].toString(36)}${random[1].toString(36)}`;
  }

  function firstPartyVisitorId() {
    try {
      let id = localStorage.getItem('egw_visitor_id');
      if (!/^egw_[0-9a-f-]{36}$/.test(id || '')) {
        id = `egw_${crypto.randomUUID()}`;
        localStorage.setItem('egw_visitor_id', id);
      }
      return id;
    } catch {
      return '';
    }
  }

  function createEliteMeta({ route, variant }) {
    const seenSteps = new Set();
    const debug = new URLSearchParams(location.search).get('meta_debug') === '1';
    const visitorId = firstPartyVisitorId();
    const routeLabel = route === '/d' ? 'Route D window offer'
      : route === '/c' ? 'Route C window estimate'
        : route === '/b' ? 'Route B shower glass estimate'
          : 'Elite Glass & Window estimate quiz';

    function context() {
      const fbclid = new URLSearchParams(location.search).get('fbclid') || '';
      return {
        route,
        variant,
        source_url: location.href,
        user_agent: navigator.userAgent,
        visitor_id: visitorId,
        fbp: cookie('_fbp'),
        fbc: cookie('_fbc') || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : ''),
      };
    }

    async function emit(eventName, parameters = {}, { id, user = {} } = {}) {
      const eventID = id || eventId(eventName.toLowerCase());
      const browserParameters = {
        content_name: routeLabel,
        route,
        variant,
        ...parameters,
      };
      if (global.fbq) {
        global.fbq(['PageView', 'Lead'].includes(eventName) ? 'track' : 'trackCustom',
          eventName, browserParameters, { eventID });
        if (debug) console.info('elite_meta_pixel_queued', eventName, eventID, route);
      }
      // On a first visit the Pixel may set _fbp shortly after fbq is queued.
      // Keep the browser event immediate, then include the real cookie in CAPI.
      if (!cookie('_fbp') && ['PageView', 'FunnelStep', 'ButtonClick'].includes(eventName)) {
        for (let attempt = 0; attempt < 20 && !cookie('_fbp'); attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      const response = await fetch('/api/capi', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          event_id: eventID,
          ...context(),
          ...parameters,
          ...user,
        }),
        keepalive: true,
      });
      if (!response.ok) throw new Error(`CAPI ${response.status}`);
      const result = await response.json();
      if (!result.ok) throw new Error('CAPI event was rejected');
      if (debug) console.info('elite_meta_capi_accepted', eventName, eventID, route,
        Boolean(context().fbp), Boolean(context().fbc));
      return { eventID, result };
    }

    function queue(eventName, parameters, options) {
      const delivery = emit(eventName, parameters, options);
      delivery.catch((error) => console.warn(`${eventName} CAPI failed`, error.message));
      return delivery;
    }

    return {
      eventId,
      context,
      pageView: () => queue('PageView'),
      step(step, answers = {}) {
        if (seenSteps.has(step)) return;
        seenSteps.add(step);
        queue('FunnelStep', { step, ...answers });
      },
      button(buttonName, step) {
        queue('ButtonClick', { button_name: buttonName, step });
      },
      lead(id, fields, answers = {}) {
        return queue('Lead', { ...answers }, { id, user: fields });
      },
    };
  }

  global.createEliteMeta = createEliteMeta;
})(window);
