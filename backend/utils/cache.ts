import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Redis client — single shared instance (singleton)
// ---------------------------------------------------------------------------
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';

let redis: Redis | null = null;

function getRedisClient(): Redis | null {
    if (redis) return redis;

    try {
        if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
            console.warn('⚠️  Upstash Redis credentials missing — caching disabled');
            return null;
        }

        redis = new Redis({
            url: UPSTASH_REDIS_REST_URL,
            token: UPSTASH_REDIS_REST_TOKEN,
        });

        console.log('✅ Upstash Redis initialized');
        return redis;
    } catch (err) {
        console.warn('⚠️  Upstash Redis init failed — caching disabled:', err);
        return null;
    }
}

// Initialise immediately
getRedisClient();

// ---------------------------------------------------------------------------
// Default TTLs (seconds)
// ---------------------------------------------------------------------------
const DEFAULT_TTL = 300; // 5 minutes

// ---------------------------------------------------------------------------
// Public cache helpers
// ---------------------------------------------------------------------------

/** Retrieve a cached value. Returns undefined on miss or when Redis is down. */
export async function cacheGet<T>(key: string): Promise<T | undefined> {
    const client = getRedisClient();
    if (!client) {
        console.log(`[Cache MISS] ${key} (Redis unavailable — using MongoDB)`);
        return undefined;
    }
    try {
        const data = await client.get<T>(key);
        if (data === null) {
            console.log(`[Cache MISS] ${key}`);
            return undefined;
        }
        console.log(`[Cache HIT ] ${key}`);
        return data; // @upstash/redis automatically parses JSON
    } catch (err) {
        console.warn('[Cache] GET error:', err);
        return undefined;
    }
}

/** Store a value with an optional TTL in seconds (default 300 s). */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    try {
        await client.set(key, value, { ex: ttlSeconds });
    } catch (err) {
        console.warn('[Cache] SET error:', err);
    }
}

/** Delete one or more exact cache keys. */
export async function cacheDel(...keys: string[]): Promise<void> {
    const client = getRedisClient();
    if (!client || keys.length === 0) return;
    try {
        await client.del(...keys);
    } catch (err) {
        console.warn('[Cache] DEL error:', err);
    }
}

/** Delete all keys whose name starts with a given prefix. */
export async function cacheDelByPrefix(prefix: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    try {
        let cursor = '0';
        const keysToDelete: string[] = [];

        do {
            const [nextCursor, keys] = await client.scan(cursor, { match: `${prefix}*`, count: 100 });
            cursor = nextCursor === '0' || !nextCursor ? '0' : nextCursor.toString();
            if (keys && keys.length > 0) {
                keysToDelete.push(...keys);
            }
        } while (cursor !== '0');

        if (keysToDelete.length > 0) {
            await client.del(...keysToDelete);
        }
    } catch (err) {
        console.warn('[Cache] DEL-BY-PREFIX error:', err);
    }
}

export default getRedisClient;

