import { isIP } from 'node:net';

/** In-process fallback limiter. Production multi-instance deployments must also use a WAF/shared store. */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const MAX_BUCKETS = 4_096;
let callsSincePrune = 0;

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkSearchRateLimit(key: string, now = Date.now()) {
  callsSincePrune += 1;
  if (callsSincePrune >= 64 || buckets.size >= MAX_BUCKETS) {
    pruneExpired(now);
    callsSincePrune = 0;
  }

  const safeKey = key.trim().slice(0, 128) || 'unattributed-client';
  const current = buckets.get(safeKey);
  if (!current || current.resetAt <= now) {
    // Never allow unbounded Map growth when a flood of unique identities arrives.
    if (!current && buckets.size >= MAX_BUCKETS) {
      return { allowed: false, remaining: 0, retryAfterSeconds: 60 };
    }
    buckets.set(safeKey, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfterSeconds: 0 };
  }
  if (current.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - current.count, retryAfterSeconds: 0 };
}

/** True only when the deployment explicitly names the trusted proxy's canonical client-IP header. */
export function hasTrustedSearchProxyConfigured(): boolean {
  const trustedHeader = process.env.DPGTAP_TRUST_PROXY_IP_HEADER?.toLowerCase();
  return trustedHeader === 'x-real-ip' || trustedHeader === 'cf-connecting-ip';
}

/** Only trust a proxy header when the deployment explicitly configures that trusted proxy. */
export function getSearchRateLimitKey(headers: Headers): string {
  const trustedHeader = process.env.DPGTAP_TRUST_PROXY_IP_HEADER?.toLowerCase();
  if (trustedHeader !== 'x-real-ip' && trustedHeader !== 'cf-connecting-ip') return 'unattributed-client';
  const value = headers.get(trustedHeader)?.trim() ?? '';
  // Accept exactly one syntactically valid address; never parse forwarding chains.
  return isIP(value) ? value : 'unattributed-client';
}
