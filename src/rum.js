// Lightweight RUM and error reporting
// - Web Vitals (CLS, LCP, FID, INP)
// - Global error / unhandledrejection
// - Axios request timing

let enabled = false;
const queue = [];

export function initRUM() {
  enabled = (import.meta.env.VITE_RUM_ENABLED === 'true');
  if (!enabled) return;

  // Web Vitals (optional dynamic import to avoid bundle bloat)
  import('web-vitals').then(({ onCLS, onLCP, onFID, onINP }) => {
    const send = (metric) => emit({ type: 'web-vital', metric });
    onCLS(send);
    onLCP(send);
    onFID(send);
    onINP(send);
  }).catch(() => {});

  // Global error listeners
  window.addEventListener('error', (e) => {
    const { message, filename, lineno, colno } = e;
    emit({ type: 'error', message, filename, lineno, colno });
  });
  window.addEventListener('unhandledrejection', (e) => {
    emit({ type: 'unhandledrejection', reason: serializeError(e.reason) });
  });

  // Flush any queued events emitted before init
  if (queue.length) {
    for (const ev of queue.splice(0)) send(ev);
  }
}

export function reportError(error, errorInfo) {
  const payload = {
    type: 'react-error',
    error: serializeError(error),
    info: errorInfo?.componentStack || null,
  };
  emit(payload);
}

export function instrumentAxios(instance) {
  // Avoid double-install
  if (!instance || instance.__rum_instrumented) return;
  instance.__rum_instrumented = true;
  instance.interceptors.request.use((config) => {
    config.metadata = { start: performance.now() };
    return config;
  });
  instance.interceptors.response.use((response) => {
    const duration = performance.now() - (response.config.metadata?.start || performance.now());
    if (!shouldSkip(response.config)) {
      emit({
        type: 'http',
        url: trimUrl(response.config.url),
        method: response.config.method,
        status: response.status,
        duration,
      });
    }
    return response;
  }, (error) => {
    const cfg = error.config || {};
    const duration = performance.now() - (cfg.metadata?.start || performance.now());
    if (!shouldSkip(cfg)) {
      emit({
        type: 'http',
        url: trimUrl(cfg.url),
        method: cfg.method,
        status: error.response?.status || 0,
        duration,
        error: serializeError(error),
      });
    }
    return Promise.reject(error);
  });
}

function shouldSkip(config) {
  const url = (config && (config.url || '')) || '';
  return /\/rum\/?$/.test(url) || /\/schema\//.test(url);
}

function trimUrl(url) {
  try { return new URL(url, window.location.origin).pathname; } catch { return url; }
}

function serializeError(err) {
  if (!err) return null;
  const out = { message: String(err?.message || err) };
  if (err.stack) out.stack = String(err.stack).split('\n').slice(0, 5).join('\n');
  return out;
}

function emit(event) {
  const payload = {
    ts: Date.now(),
    url: window.location.href,
    ua: navigator.userAgent,
    ...event,
  };
  if (!enabled) {
    queue.push(payload);
    return;
  }
  send(payload);
}

function send(payload) {
  // Use fetch directly to avoid axios interceptors
  const base = import.meta.env.VITE_API_BASE_URL || '/api/';
  const baseURL = base.endsWith('/') ? base : base + '/';
  fetch(baseURL + 'rum/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}
