/**
 * Access token handling for the private assessment flow.
 *
 * Flow: bot sends `/?token=xxx` -> token is captured from the URL once,
 * stored in sessionStorage, then forwarded with every /quiz/* navigation.
 * Validity is ALWAYS decided by the Worker API, never by local state.
 */

const API_BASE = 'https://fdma-api.bchdims.workers.dev';
const KEY = 'fdma_access_token';
const DEV_BYPASS = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS === 'true';

export type AccessState = 'checking' | 'valid' | 'invalid' | 'missing' | 'error';

export function captureTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  // ponytail: param named 'k' so the URL doesn't advertise a token.
  const token = new URLSearchParams(window.location.search).get('k');
  if (token && token.length >= 16 && token.length <= 128) {
    sessionStorage.setItem(KEY, token);
    // Clean the URL so the token doesn't linger in the address bar / history.
    const url = new URL(window.location.href);
    url.searchParams.delete('k');
    window.history.replaceState(null, '', url.toString());
    return token;
  }
  return null;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(KEY) ?? captureTokenFromUrl();
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/access/verify`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true && data.status === 'active';
    // ponytail: any error/unknown shape -> deny. Fail closed.
  } catch {
    return false;
  }
}
