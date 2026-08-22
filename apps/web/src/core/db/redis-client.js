/**
 * Upstash Redis Serverless REST Client
 * Ultra-lightweight in-browser & serverless cache via Upstash REST API
 */

const REDIS_URL = import.meta.env?.VITE_UPSTASH_REDIS_REST_URL || 'https://internal-skunk-76667.upstash.io';
const REDIS_TOKEN = import.meta.env?.VITE_UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAASt7AAIgcDI4ODExZThkNTY2ZjE0ODlhOGYwZWMzYzVjZTdkMTM1OQ';

export const isRedisConfigured = () => {
  return Boolean(REDIS_URL && REDIS_TOKEN && REDIS_URL.includes('upstash.io'));
};

/**
 * Get cached value by key
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function redisGet(key) {
  if (!isRedisConfigured()) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.result === null) return null;
    try {
      return JSON.parse(data.result);
    } catch {
      return data.result;
    }
  } catch (err) {
    console.warn('[Redis] Get error (graceful fallback):', err.message);
    return null;
  }
}

/**
 * Set value in Redis with optional TTL in seconds
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds]
 * @returns {Promise<boolean>}
 */
export async function redisSet(key, value, ttlSeconds = 86400) {
  if (!isRedisConfigured()) return false;
  try {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
    let url = `${REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(stringVal)}`;
    if (ttlSeconds) {
      url += `?ex=${ttlSeconds}`;
    }
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
      },
    });
    return res.ok;
  } catch (err) {
    console.warn('[Redis] Set error (graceful fallback):', err.message);
    return false;
  }
}
