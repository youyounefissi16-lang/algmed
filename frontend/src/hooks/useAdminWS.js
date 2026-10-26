import { useEffect, useRef, useState } from 'react';
import { refreshToken, clearToken } from '../utils/tokenStore';
import { API_BASE_URL } from '../config/api';

const RECONNECT_BASE = 1000;
const RECONNECT_MAX = 30000;
const MAX_RETRIES = 10;

export const useAdminWS = () => {
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const timerRef = useRef(null);
  const cancelledRef = useRef(false);

  const connect = () => {
    // The API may live on a different origin than the page (static hosting).
    // Derive the socket from the API base so /ws/admin always reaches the backend.
    const apiUrl = new URL(API_BASE_URL || window.location.origin, window.location.origin);
    const proto = apiUrl.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${proto}://${apiUrl.host}/ws/admin`;

    refreshToken().then((token) => {
      if (cancelledRef.current || !token) return;
      const ws = new WebSocket(wsUrl, [token]);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelledRef.current) { ws.close(); return; }
        setConnected(true);
        retriesRef.current = 0;
      };

      ws.onmessage = (msg) => {
        if (cancelledRef.current) return;
        try {
          setLastEvent(JSON.parse(msg.data));
        } catch { /* ignore malformed */ }
      };

      ws.onclose = (event) => {
        if (cancelledRef.current) return;
        setConnected(false);
        wsRef.current = null;
        // 4003 = this device was displaced by a newer sign-in. Retrying would
        // loop against a permanently refused socket, so sign out instead.
        if (event?.code === 4003) {
          clearToken();
          try { localStorage.removeItem('userId'); } catch { /* incognito */ }
          window.location.href = '/login?conflict=1';
          return;
        }
        if (retriesRef.current >= MAX_RETRIES) return;
        const delay = Math.min(RECONNECT_BASE * 2 ** retriesRef.current, RECONNECT_MAX);
        retriesRef.current += 1;
        timerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {};
    });
  };

  useEffect(() => {
    cancelledRef.current = false;
    connect();
    return () => {
      cancelledRef.current = true;
      if (wsRef.current) wsRef.current.close();
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, []);

  return { lastEvent, connected };
};
