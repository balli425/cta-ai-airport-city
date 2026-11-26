const COUNTER_API = 'https://script.google.com/macros/s/AKfycbwU0s_RKlMyfK7WSxKfom27IClw8LRreRStRKMJrcN6u6nPNcV9TVWjR6K_P1fEcOBvHw/exec';
const REFRESH_MS = 30_000;
const live = location.origin === 'https://balli425.github.io'
  && location.pathname.startsWith('/cta-ai-airport-city/');
const recorded = new Set();

async function request(url, options = {}) {
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'omit',
    signal: AbortSignal.timeout(12_000),
    ...options
  });
  if (!response.ok) throw new Error('Counter service unavailable');
  return response.json();
}

async function recordOnce(kind) {
  if (!live || recorded.has(kind)) return;
  const key = 'airport_20261127_' + kind;
  recorded.add(kind);
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // Keep counting once per page if browser storage is unavailable.
  }

  const data = await request(COUNTER_API, {
    method: 'POST',
    body: JSON.stringify({ kind }),
    keepalive: true
  });
  if (data.ok === true) return true;
  // The service confirms a busy lock did not write. A lost response can have
  // committed successfully, so retry only when the service confirms no write.
  if (data.error === 'busy') {
    recorded.delete(kind);
    try { sessionStorage.removeItem(key); } catch {}
  }
  throw new Error('Counter write unsuccessful');
}

export function recordUse(kind) {
  if (/^[a-z0-9_-]+$/.test(kind)) recordOnce(kind).catch(() => {});
}

export function watchCounts(render, { details = false, visit = false } = {}) {
  let pending = false;
  let visitFailed = false;
  async function refresh() {
    if (pending || document.visibilityState !== 'visible') return;
    pending = true;
    try {
      if (visit) {
        try {
          if (await recordOnce('visit')) visitFailed = false;
        } catch {
          visitFailed = true;
        }
      }
      const url = new URL(COUNTER_API);
      if (details) url.searchParams.set('view', 'stats');
      const data = await request(url);
      if (data.ok !== true) throw new Error('Counter service unavailable');
      render(data, visitFailed);
    } catch {
      render(null, visitFailed);
    } finally {
      pending = false;
    }
  }

  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', event => { if (event.persisted) refresh(); });
  window.addEventListener('online', refresh);
  window.setInterval(refresh, REFRESH_MS);
  refresh();
}
