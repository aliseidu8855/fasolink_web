// Lightweight WebSocket helper for this app

const getBase = () => {
  const raw = import.meta.env?.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin + '/' : '');
  try {
    return new URL(raw);
  } catch {
    return new URL('/', window.location.origin);
  }
};

export const buildWsUrl = (path, withToken = true) => {
  const base = getBase();
  const proto = base.protocol === 'https:' ? 'wss:' : 'ws:';
  const origin = `${proto}//${base.host}`; // drop any /api/ path segment
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${origin}${normalizedPath}`;
  if (withToken && typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}token=${encodeURIComponent(token)}`;
    }
  }
  return url;
};

export const connectSocket = (path, { onMessage, onOpen, onClose, onError } = {}) => {
  const url = buildWsUrl(path);
  const ws = new WebSocket(url);
  if (onOpen) ws.addEventListener('open', onOpen);
  if (onClose) ws.addEventListener('close', onClose);
  if (onError) ws.addEventListener('error', onError);
  if (onMessage) ws.addEventListener('message', (e) => {
    try {
      const data = JSON.parse(e.data);
      onMessage(data);
    } catch {
      // ignore non-JSON frames
    }
  });
  const sendJson = (obj) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  };
  return { socket: ws, sendJson, close: () => ws.close() };
};
